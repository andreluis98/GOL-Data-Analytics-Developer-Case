export interface BookingTable {
  first_name: string,
  last_name: string,
  birthday: string,
  document: string,
  departure_date: string,
  departure_iata: string,
  arrival_iata: string,
  arrival_date: string,
  created_at?: string
  id?: number
  updated_at?: string
}