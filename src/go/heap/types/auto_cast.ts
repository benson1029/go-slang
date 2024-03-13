import { Heap } from "../heap";
import { ComplexLinkedList } from "./complex/linked_list";
import { ComplexPointer } from "./complex/pointer";
import { ComplexString } from "./complex/string";
import { ControlAssign } from "./control/assign";
import { ControlBinary } from "./control/binary";
import { ControlCall } from "./control/call";
import { ControlFunction } from "./control/function";
import { ControlLambdaCall } from "./control/lambda_call";
import { ControlName } from "./control/name";
import { ControlPostfix } from "./control/postfix";
import { ControlSequence } from "./control/sequence";
import { ControlUnary } from "./control/unary";
import { ControlVar } from "./control/var";
import { HeapObject } from "./objects";
import { PrimitiveBool } from "./primitive/bool";
import { PrimitiveFloat32 } from "./primitive/float32";
import { PrimitiveInt32 } from "./primitive/int32";
import { PrimitiveNil } from "./primitive/nil";
import { PrimitiveRune } from "./primitive/rune";
import {
  TAG_PRIMITIVE_nil,
  TAG_PRIMITIVE_bool,
  TAG_PRIMITIVE_int32,
  TAG_PRIMITIVE_float32,
  TAG_PRIMITIVE_rune,
  TAG_COMPLEX_string,
  TAG_COMPLEX_linked_list,
  TAG_COMPLEX_pointer,
  TAG_CONTROL_name,
  TAG_CONTROL_literal,
  TAG_CONTROL_var,
  TAG_CONTROL_assign,
  TAG_CONTROL_unary,
  TAG_CONTROL_postfix,
  TAG_CONTROL_binary,
  TAG_CONTROL_sequence,
  TAG_CONTROL_call,
  TAG_CONTROL_function,
  TAG_CONTROL_lambda_call,
} from "./tags"


function auto_cast(heap: Heap, address: number): HeapObject {
  const tag = heap.get_tag(address);
  switch (tag) {
    case TAG_PRIMITIVE_nil:
      return new PrimitiveNil(heap, address);
    case TAG_PRIMITIVE_bool:
      return new PrimitiveBool(heap, address);
    case TAG_PRIMITIVE_int32:
      return new PrimitiveInt32(heap, address);
    case TAG_PRIMITIVE_float32:
      return new PrimitiveFloat32(heap, address);
    case TAG_PRIMITIVE_rune:
      return new PrimitiveRune(heap, address);
    case TAG_COMPLEX_string:
      return new ComplexString(heap, address);
    case TAG_COMPLEX_linked_list:
      return new ComplexLinkedList(heap, address);
    case TAG_COMPLEX_pointer:
      return new ComplexPointer(heap, address);
    case TAG_CONTROL_name:
      return new ControlName(heap, address);
    case TAG_CONTROL_literal:
      throw new Error("ControlLiteral is an abstract class and cannot be instantiated.");
    case TAG_CONTROL_var:
      return new ControlVar(heap, address);
    case TAG_CONTROL_assign:
      return new ControlAssign(heap, address);
    case TAG_CONTROL_unary:
      return new ControlUnary(heap, address);
    case TAG_CONTROL_postfix:
      return new ControlPostfix(heap, address);
    case TAG_CONTROL_binary:
      return new ControlBinary(heap, address);
    case TAG_CONTROL_sequence:
      return new ControlSequence(heap, address);
    case TAG_CONTROL_function:
      return new ControlFunction(heap, address);
    case TAG_CONTROL_call:
      return new ControlCall(heap, address);
    case TAG_CONTROL_lambda_call:
      return new ControlLambdaCall(heap, address);
    default:
      throw new Error("Unknown tag");
  }
}

export { auto_cast };
