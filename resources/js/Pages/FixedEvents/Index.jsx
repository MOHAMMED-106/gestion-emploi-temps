import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';

export default function FixedEventsIndex({ fixedEvents }) {
    const { data, setData, post, processing } = useForm({
        title: '',
        day_of_week: 'Lundi',
        start_time: '09:00',
        end_time: '11:00'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/fixed-events');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des cours" />
            <div className="container mt-4">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h4>📚 Ajouter un cours fixe</h4>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Matière</label>
                                <input type="text" className="form-control" value={data.title} onChange={e => setData('title', e.target.value)} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Jour</label>
                                <select className="form-select" value={data.day_of_week} onChange={e => setData('day_of_week', e.target.value)}>
                                    <option>Lundi</option><option>Mardi</option><option>Mercredi</option>
                                    <option>Jeudi</option><option>Vendredi</option><option>Samedi</option>
                                </select>
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label">Heure début</label>
                                    <input type="time" className="form-control" value={data.start_time} onChange={e => setData('start_time', e.target.value)} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Heure fin</label>
                                    <input type="time" className="form-control" value={data.end_time} onChange={e => setData('end_time', e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary mt-3" disabled={processing}>
                                {processing ? 'Ajout...' : 'Ajouter le cours'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="card mt-4 shadow">
                    <div className="card-header bg-secondary text-white">
                        <h5>📋 Liste des cours</h5>
                    </div>
                    <div className="card-body">
                        <table className="table">
                            <thead><tr><th>Jour</th><th>Matière</th><th>Horaire</th></tr></thead>
                            <tbody>
                                {fixedEvents?.map(event => (
                                    <tr key={event.id}>
                                        <td>{event.day_of_week}</td><td>{event.title}</td>
                                        <td>{event.start_time} - {event.end_time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}