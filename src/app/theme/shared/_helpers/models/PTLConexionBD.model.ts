export class PTLConexionBDModel {
  constructor(
    public conexionId?: number,
    public codigoConexion?: string,
    public codigoSuscriptor?: string,
    public codigoPaquete?: string,
    public nombreConexion?: string,
    public nombreServidor?: string,
    public BDNombre?: string,
    public BDUser?: string,
    public BDPassword?: string,
    public BDPort?: string,
    public descripcionConexion?: string,
    public estadoConexion?: boolean,
    public nombreSuscriptor?: string,
    public nomEstado?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
