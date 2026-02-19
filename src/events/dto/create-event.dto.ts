export class CreateEventDto {
    name: string;
    description?: string;
    startDate: string; // ISO Date string
    endDate: string;   // ISO Date string
}
