import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ schedules, activeSchedule }) {
    return (
        <AuthenticatedLayout>
            <Head title="Mes plannings" />
            
            <div className="container mt-4">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h4 className="mb-0">📚 Mes plannings d'étude</h4>
                    </div>
                    <div className="card-body">
                        <div className="alert alert-success">
                            ✅ La route fonctionne parfaitement !
                        </div>
                        <p>Nombre de plannings: {schedules?.length || 0}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}