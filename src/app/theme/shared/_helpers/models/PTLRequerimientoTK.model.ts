export class PTLRequerimientoTKModel {
  constructor(
    public requerimientoId?: number,
    public codigoRequerimiento?: string,
    public codigoTicket?: string,
    public nombreRequerimiento?: string,
    public descripcionRequerimiento?: string,
    public estadoRequerimiento?: string,
    public nomEstado?: string,
    public nomTicket?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
