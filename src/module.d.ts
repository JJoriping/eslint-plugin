import type { ParserServices } from "@typescript-eslint/utils";
import type { TypeChecker } from "typescript";

export module "@typescript-eslint/utils/dist/ts-eslint"{
  export interface SharedConfigurationSettings{
    'service'?: ParserServices,
    'typeChecker'?: TypeChecker
  }
}