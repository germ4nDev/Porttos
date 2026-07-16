/* eslint-disable @typescript-eslint/no-explicit-any */
export class PTLActividadModel {
  constructor(
    public actividadId?: number,
    public codigoActividad?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public codigoModulo?: string,
    public actividad?: string,
    public descripcion?: string,
    public estadoActividad?: boolean,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string,
    public nomEstado?: string,
    public nomAplicacion?: string,
    public nomSuite?: string,
    public nomModulo?: string,
  ) {}
}
