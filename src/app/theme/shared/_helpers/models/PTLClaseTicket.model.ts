export class PTLClaseTicketModel {
  constructor(
    public claseTicketId?: number,
    public codigoClase?: string,
    public claseTicket?: string,
    public descripcionClase?: string,
    public estadoClase?: boolean,
    public nomEstado?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
