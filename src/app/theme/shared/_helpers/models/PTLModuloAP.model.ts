export class PTLModuloAP {
  constructor(
    public ModuloId?: number,
    public codigoModulo?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public codigoPadre?: string,
    public nombreModulo?: string,
    public descripcionModulo?: string,
    public rutaModulo?: string,
    public precioModulo?: number,
    public icon?: string,
    public translateKey?: string,
    public estadoModulo?: boolean,
    public hijos?: boolean,
    public checked?: boolean,
    public codigoBiblioteca?: string,
    public nomBiblioteca?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string,
    public nomEstado?: string
  ) {}
}
