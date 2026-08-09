export interface ICreateInstructorPayload {
    password: string;
    instructor: {
        name: string;
        email: string;
        profilePhoto?: string;
        contactNumber?: string;
        address?: string;
        bio?: string;
        qualification?: string;
        experience?: number;
        currentWorkingPlace?: string;
        designation?: string;
    };
}
