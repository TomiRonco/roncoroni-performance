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
}

export interface Database {
  public: {
    Tables: {
      reparaciones: {
        Row: Reparacion;
        Insert: Omit<Reparacion, 'id' | 'created_at'>;
        Update: Partial<Omit<Reparacion, 'id' | 'created_at'>>;
      };
    };
  };
}
