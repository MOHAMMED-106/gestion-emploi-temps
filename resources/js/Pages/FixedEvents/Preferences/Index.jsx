import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PreferencesIndex({ preferences }) {
    const { data, setData, post, processing } = useForm({
        wake_up_time: preferences?.wake_up_time || '08:00',
        sleep_time: preferences?.sleep_time || '22:00',
        study_preference: preferences?.study_preference || 'morning',
        concentration_hours: preferences?.concentration_hours || 2,
        desired_free_time: preferences?.desired_free_time || 2
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/preferences');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Mes préférences" />
            <div className="container mt-4">
                <div className="card shadow">
                    <div className="card-header bg-success text-white">
                        <h4>⚙️ Mes préférences d'étude</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">Heure de réveil</label>
                                    <input type="time" className="form-control" value={data.wake_up_time} onChange={e => setData('wake_up_time', e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Heure de coucher</label>
                                    <input type="time" className="form-control" value={data.sleep_time} onChange={e => setData('sleep_time', e.target.value)} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <label className="form-label">Préférence d'étude</label>
                                <select className="form-select" value={data.study_preference} onChange={e => setData('study_preference', e.target.value)}>
                                    <option value="morning">Matin (productif tôt)</option>
                                    <option value="night">Soir (productif tard)</option>
                                    <option value="normal">Normal</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-success mt-3" disabled={processing}>
                                {processing ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}