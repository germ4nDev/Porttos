import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";

export class PTLTicketAPModel {
  constructor(
    public ticketId?: number,
    public codigoTicket?: string,
    public codigoAplicacion?: string,
    public codigoSuite?: string,
    public codigoModulo?: string,
    public codigoClase?: string,
    public fechaTicket?: string,
    public nombreTicket?: string,
    public codigoUsuarioSender?: string,
    public codigoUsuarioAsignado?: string,
    public fecha?: NgbDateStruct,
    public fechaAsignacion?: string | null | undefined,
    public prioridad?: string,
    public colorPrioridad?: string,
    public descripcionTicket?: string,
    public definicionRequerimiento?: string,
    public estadoTicket?: string,
    public capturaTicket?: string,
    public nomEstado?: string,
    public nomAplicacion?: string,
    public codigoUsuarioCreacion?: string,
    public fechaCreacion?: string,
    public codigoUsuarioModificacion?: string,
    public fechaModificacion?: string
  ) {}
}
