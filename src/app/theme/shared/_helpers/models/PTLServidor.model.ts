export class PTLServidorModel {
  constructor(
    public servidorId?: number,
    public codigoServidor?: string,
    public nombreServidor?: string,
    public descripcionServidor?: string,
    public rutaServidor?: string,
    public direccionIP?: string,
    public estadoServidor?: boolean,
    public nomEstado?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
