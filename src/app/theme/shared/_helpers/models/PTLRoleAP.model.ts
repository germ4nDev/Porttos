export class PTLRoleAPModel {
  constructor(
    public roleId?: number,
    public codigoRole?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public nombreRole?: string,
    public descripcionRole?: string,
    public estadoRole?: boolean,
    public nomAplicacion?: string,
    public nomEstado?: string,
    public checked?: boolean,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
