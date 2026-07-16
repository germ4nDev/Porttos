import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export class PTLSeguimientoTKModel {
  constructor(
    public seguimientoId?: number,
    public codigoSeguimiento?: string,
    public codigoTicket?: string,
    public codigoRequerimiento?: string,
    public nombreSeguimiento?: string,
    public fechaSeguimiento?: string,
    public fecha?: NgbDateStruct,
    public descripcionSeguimiento?: string,
    public estadoSeguimiento?: string,
    public estadoTicket?: string,
    public capturaSeguimiento?: string,
    public definicionRequerimiento?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
