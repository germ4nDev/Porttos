/* eslint-disable @typescript-eslint/no-explicit-any */
export class PTLAplicacionModel {
  constructor(
    public aplicacionId?: number,
    public codigoAplicacion?: string,
    public nombreAplicacion?: string,
    public descripcionAplicacion?: string,
    public estadoAplicacion?: boolean,
    public translateKey?: string,
    public imagenInicio?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string,
    public nomEstado?: string,
  ) {}
}
