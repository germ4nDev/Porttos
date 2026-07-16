export class PTLModuloPQModel {
  constructor(
    public moduloPQId?: number,
    public codigoModuloPQ?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public codigoModulo?: string,
    public codigoPaquete?: string,
    public estadoModuloPQ?: boolean,
    public nomPaquete?: string,
    public nomplicacion?: string,
    public nomsuite?: string,
    public nomModulo?: string,
    public nomEstado?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}

export class PTLModuloPQModelAdm {
  constructor(
    public codigoPaquete?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public modulos?: any,
  ) {}
}
