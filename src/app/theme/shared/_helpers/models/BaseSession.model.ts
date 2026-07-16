/* eslint-disable @typescript-eslint/no-explicit-any */
export class BaseSessionModel {
  constructor(
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public codigoModulo?: string,
    public codigoSuscriptor?: string,
    public usuarioCreacion?: string,
    public usuarioModificacion?: string,
    public fechaCreacion?: Date,
    public fechaModificacion?: Date,
    public dataLog?: any
  ) {}
}
