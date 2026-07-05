import type { DdysLocals } from 'ddys-sveltekit/server';

declare global {
  namespace App {
    interface Locals extends DdysLocals {}
  }
}

export {};
