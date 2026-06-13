declare module "bun:test" {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: any;
  export const mock: {
    (fn: (...args: any[]) => any): any;
    module: (moduleName: string, mockFactory: () => any) => any;
  };
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const spyOn: (obj: any, method: string) => any;
}

declare module "fs" {
  export function readFileSync(path: any, options?: any): string;
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
