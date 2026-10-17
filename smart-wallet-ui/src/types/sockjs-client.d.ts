declare module 'sockjs-client' {
  class SockJS extends WebSocket {
    constructor(url: string, _protocols?: string[] | string, _options?: Record<string, unknown>);
  }
  export default SockJS;
}
