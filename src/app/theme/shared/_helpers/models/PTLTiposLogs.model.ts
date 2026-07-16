export class PTLTiposLogsModel {
  constructor(
    public tipoLogId?: number,
    public codigoTipoLog?: string,
    public nombreTipo?: string,
    public descripcionTipo?: string,
    public codigoRespuesta?: string,
    public estadoTipo?: boolean,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
