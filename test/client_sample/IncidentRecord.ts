export class IncidentRecord{
    _id: string;
    record_no: number;
    incident_type: string;
    incident_who: string;
    incident_when: string;
    incident_comments: string;
    incident_attachment: File;
    incident_complainant_id: string;
    incident_status: string;
    incident_reason: string;
    record_date: string;
    anonymous: boolean;
    displayed: boolean;
}