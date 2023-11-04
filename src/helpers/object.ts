import { ClassConstructor, plainToInstance } from 'class-transformer';

export function PlainToInstance<T, V>(model: ClassConstructor<T>, plain: V): T {
  return plainToInstance(model, plain, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
    strategy: 'excludeAll',
  });
}

export function PlainToInstanceList<T, V>(
  model: ClassConstructor<T>,
  plain: V[],
): T[] {
  return plainToInstance(model, plain, {
    excludeExtraneousValues: true,
    enableImplicitConversion: true,
    strategy: 'excludeAll',
  });
}
