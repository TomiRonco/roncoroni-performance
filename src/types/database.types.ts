export interface Reparacion {
  id?: string;
  created_at?: string;
  nombre: string;
  apellido: string;
  celular: string;
  marca: string;
  cilindrada: string;
  observaciones: string;
  user_id?: string;
  lista_para_retirar?: boolean;
  fecha_notificacion_retiro?: string;
  presupuesto?: Presupuesto;
}

export interface Presupuesto {
  id?: string;
  reparacion_id?: string;
  descripcion_trabajo: string;
  costo_mano_obra: number;
  costo_repuestos: number;
  total: number;
  enviado_whatsapp?: boolean;
  fecha_envio?: string;
  created_at?: string;
}

export interface Database {
  public: {
    Tables: {
      reparaciones: {
        Row: Reparacion;
        Insert: Omit<Reparacion, 'id' | 'created_at'>;
        Update: Partial<Omit<Reparacion, 'id' | 'created_at'>>;
      };
      presupuestos: {
        Row: Presupuesto;
        Insert: Omit<Presupuesto, 'id' | 'created_at'>;
        Update: Partial<Omit<Presupuesto, 'id' | 'created_at'>>;
      };
    };
  };
}
