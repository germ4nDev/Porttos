export class PTLEmpresaSCModel {
  constructor(
    public empresaId?: number,
    public codigoEmpresaSC?: string,
    public codigoSuscriptor?: string,
    public nombreEmpresa?: string,
    public descripcionEmpresa?: string,
    public logoEmpresa?: string,
    public estadoEmpresa?: boolean,
    public checked?: boolean,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
