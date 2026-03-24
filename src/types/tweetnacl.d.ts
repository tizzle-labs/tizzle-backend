declare module 'tweetnacl' {
  export namespace sign {
    export namespace detached {
      export function verify(
        message: Uint8Array,
        signature: Uint8Array,
        publicKey: Uint8Array,
      ): boolean;
    }
  }
}
