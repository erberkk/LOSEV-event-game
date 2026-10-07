/**
 * Kadıköy'de LÖSEV'in İzinde — katılımcı kayıtlarını Google E-Tablo'ya yazar.
 * Kurulum: apps-script/KURULUM.md
 *
 * Site şu olayları gönderir (JSON, text/plain):
 *   { type: 'register', playerId, name, contact, at }
 *   { type: 'found',    playerId, token, method, at }
 *   { type: 'complete', playerId, certNo, at }
 */

const SHEET_NAME = 'Katılımcılar'
const HEADERS = ['Oyuncu ID', 'Ad Soyad', 'E-posta / Telefon', 'Kayıt', 'L', 'Ö', 'S', 'E', 'V', 'Bulunan', 'Tamamladı', 'Sertifika No', 'Son İşlem']
const COL = { id: 1, name: 2, contact: 3, registered: 4, firstLetter: 5, count: 10, completed: 11, certNo: 12, last: 13 }
const LETTER_COLUMN = { L: 0, O: 1, S: 2, E: 3, V: 4 }

// QR token → harf. Sitedeki src/data/letters.ts ile aynı olmalı.
const TOKENS = {
  'kdk-l-7q2kx9': 'L',
  'kdk-o-m4ht2c': 'O',
  'kdk-s-p8wv1r': 'S',
  'kdk-e-z3nd6y': 'E',
  'kdk-v-b5jq8a': 'V',
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const ev = JSON.parse(e.postData.contents)
    if (!ev || typeof ev.playerId !== 'string' || !/^[A-Z0-9]{6,16}$/.test(ev.playerId)) return reply('bad')
    const sheet = getSheet_()
    const at = new Date(Number(ev.at) || Date.now())
    let row = findRow_(sheet, ev.playerId)

    if (ev.type === 'register') {
      const name = clean_(ev.name, 60)
      const contact = clean_(ev.contact, 80)
      if (!name || !contact) return reply('bad')
      if (!row) {
        sheet.appendRow([ev.playerId, name, contact, at, '', '', '', '', '', 0, '', '', new Date()])
        return reply('ok')
      }
      sheet.getRange(row, COL.name, 1, 3).setValues([[name, contact, at]])
    } else if (ev.type === 'found') {
      const letter = TOKENS[String(ev.token || '').toLowerCase()]
      if (!letter) return reply('bad')
      if (!row) {
        // kayıt olayı henüz ulaşmadıysa satırı aç; ad sonra dolar
        sheet.appendRow([ev.playerId, '', '', '', '', '', '', '', '', 0, '', '', new Date()])
        row = sheet.getLastRow()
      }
      const cell = sheet.getRange(row, COL.firstLetter + LETTER_COLUMN[letter])
      if (!cell.getValue()) cell.setValue(at)
      const letters = sheet.getRange(row, COL.firstLetter, 1, 5).getValues()[0]
      sheet.getRange(row, COL.count).setValue(letters.filter(String).length)
    } else if (ev.type === 'complete') {
      if (!row) return reply('bad')
      sheet.getRange(row, COL.completed, 1, 2).setValues([[at, clean_(ev.certNo, 30)]])
    } else {
      return reply('bad')
    }
    sheet.getRange(row, COL.last).setValue(new Date())
    return reply('ok')
  } catch (err) {
    return reply('error')
  } finally {
    lock.releaseLock()
  }
}

/** Tarayıcıdan açınca çalıştığını görmek için */
function doGet() {
  return reply('LÖSEV İzinde kayıt servisi çalışıyor.')
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow(HEADERS)
    sheet.setFrozenRows(1)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#FFC21A')
    sheet.getRange('D:I').setNumberFormat('dd.MM.yyyy HH:mm')
    sheet.getRange('K:K').setNumberFormat('dd.MM.yyyy HH:mm')
    sheet.getRange('M:M').setNumberFormat('dd.MM.yyyy HH:mm')
  }
  return sheet
}

function findRow_(sheet, id) {
  const hit = sheet.getRange('A:A').createTextFinder(id).matchEntireCell(true).findNext()
  return hit ? hit.getRow() : null
}

/** Formül enjeksiyonunu önle (=, +, -, @ ile başlayan değerler) ve uzunluğu sınırla */
function clean_(v, max) {
  const s = String(v == null ? '' : v).trim().slice(0, max)
  return /^[=+\-@]/.test(s) ? "'" + s : s
}

function reply(text) {
  return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT)
}

/** Kurulumdan sonra bir kez çalıştır: tabloyu hazırlar ve izinleri ister */
function kurulum() {
  getSheet_()
}
