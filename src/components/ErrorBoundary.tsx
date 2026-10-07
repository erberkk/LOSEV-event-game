import { Component, type ReactNode } from 'react'

/** Tembel yüklenen parça (ör. harita) ağ hatasıyla düşerse yalnızca o alan yedeğe döner, sayfa çökmez. */
export default class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
