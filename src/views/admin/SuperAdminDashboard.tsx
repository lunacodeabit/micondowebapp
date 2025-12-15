import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { Company } from '../../types'; 
import { collection, doc, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig'; 
import { Modal } from '../../components/ui/Modal'; 
import { Spinner } from '../../components/ui/Spinner';
import { getLocalDateString } from '../../utils/date';
import { DevRoadmap } from '../dev/DevRoadmap'; 

type CompanyFormProps = {
    isOpen: boolean;
    onClose: () => void;
    onCompanySaved: () => void; 
    defaultValues: Company | null; 
};

const CompanyForm = ({ isOpen, onClose, onCompanySaved, defaultValues }: CompanyFormProps) => {
    const { addToast } = useToast();
    
    const getInitialState = () => {
        if (defaultValues) {
            return {
                name: defaultValues.name,
                address: defaultValues.address,
                phone: defaultValues.phone,
                email: defaultValues.email,
                rnc: defaultValues.rnc,
                adminUserEmail: defaultValues.adminUserEmail,
                billingStartDate: defaultValues.billingStartDate,
                gracePeriodDays: defaultValues.gracePeriodDays,
            };
        }
        return {
            name: '', address: '', phone: '', email: '', rnc: '',
            adminUserEmail: '', billingStartDate: getLocalDateString(), gracePeriodDays: 7
        };
    };

    const [formData, setFormData] = useState(getInitialState());
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [adminPassword, setAdminPassword] = useState(''); 
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState());
            setLogoFile(null); 
            setAdminPassword('');
        }
    }, [isOpen, defaultValues]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? Number(value) : value 
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!defaultValues && (!adminPassword || adminPassword.length < 6)) {
            addToast('La contraseña del admin es requerida (mínimo 6 caracteres).', 'error');
            setLoading(false);
            return;
        }

        try {
            let logoUrl: string | null = defaultValues?.logoUrl || null; 

            if (logoFile) {
                const storageRef = ref(storage, `company_logos/${formData.rnc}-${logoFile.name}`);
                const snapshot = await uploadBytes(storageRef, logoFile);
                logoUrl = await getDownloadURL(snapshot.ref);
            }

            const companyData = {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                rnc: formData.rnc,
                logoUrl: logoUrl,
                adminUserEmail: formData.adminUserEmail,
                billingStartDate: formData.billingStartDate,
                gracePeriodDays: formData.gracePeriodDays,
                status: defaultValues?.status || 'Activo',
                // --- CORRECCIÓN: AÑADIMOS EL CAMPO 'PLAN' ---
                plan: defaultValues?.plan || 'Pro', // Valor por defecto
            };

            if (defaultValues && defaultValues.id) {
                const companyRef = doc(db, "companies", defaultValues.id);
                await updateDoc(companyRef, companyData);
                addToast(`Compañía "${formData.name}" actualizada.`, 'success');
            } else {
                await addDoc(collection(db, "companies"), companyData);
                addToast(`Compañía "${formData.name}" creada. (Usuario admin PENDIENTE).`, 'success');
            }
            
            setLoading(false);
            onCompanySaved(); 
            onClose(); 

        } catch (error) {
            console.error("Error saving company:", error);
            addToast('Error al guardar la compañía. Inténtalo de nuevo.', 'error');
            setLoading(false);
        }
    };

    return (
        <Modal 
            title={defaultValues ? `Editando: ${defaultValues.name}` : "Crear Nueva Compañía Administradora"} 
            isOpen={isOpen} 
            onClose={onClose} 
            size="3xl"
        >
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">Información de la Compañía</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Nombre de la Compañía</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">RNC</label>
                    <input type="text" name="rnc" value={formData.rnc} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Email de Facturación</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Teléfono</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Dirección</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="md:col-span-2 mb-6">
                    <label className="block text-sm font-medium text-neutral-400">Logo de la Compañía (Opcional)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} 
                        className="mt-1 block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    {logoFile && <p className="mt-2 text-xs text-neutral-500">Archivo seleccionado: {logoFile.name}</p>}
                    {!logoFile && defaultValues?.logoUrl && (
                         <p className="mt-2 text-xs text-neutral-500">Logo actual: {defaultValues.logoUrl.split('%2F').pop()?.split('?')[0]}</p>
                    )}
                </div>

                <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">Administrador Principal de la Compañía</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Email del Admin (Login)</label>
                    <input type="email" name="adminUserEmail" value={formData.adminUserEmail} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Nueva Contraseña (Opcional)</label>
                    <input type="password" name="adminPassword" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} 
                        placeholder={defaultValues ? "Dejar en blanco para no cambiar" : "Mínimo 6 caracteres"}
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>

                <h3 className="md:col-span-2 text-lg font-semibold text-white border-b border-neutral-700 pb-2 mb-2">Facturación SaaS</h3>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Inicio de Facturación</label>
                    <input type="date" name="billingStartDate" value={formData.billingStartDate} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-400">Días de Gracia</label>
                    <input type="number" name="gracePeriodDays" value={formData.gracePeriodDays} onChange={handleChange} required 
                        className="mt-1 block w-full rounded-md border-neutral-700 bg-neutral-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                </div>

                <div className="md:col-span-2 flex justify-end pt-4">
                    <button type="button" onClick={onClose} disabled={loading}
                        className="mr-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center">
                        {loading && <Spinner className="w-4 h-4 mr-2" />}
                        {loading ? 'Guardando...' : 'Guardar Compañía'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};


export const SuperAdminDashboard = () => {
    const { logout } = useAuth();
    const { addToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false); 
    
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [showRoadmap, setShowRoadmap] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const companiesCollection = collection(db, "companies"); 
            const companySnapshot = await getDocs(companiesCollection);
            const companyList: Company[] = companySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Sin Nombre',
                    rnc: data.rnc || 'N/A',
                    address: data.address || 'Sin Dirección',
                    phone: data.phone || 'N/A',
                    email: data.email || 'N/A',
                    logoUrl: data.logoUrl || null,
                    status: data.status || 'Inactivo',
                    adminUserEmail: data.adminUserEmail || 'N/A',
                    billingStartDate: data.billingStartDate || 'N/A',
                    gracePeriodDays: data.gracePeriodDays || 0,
                    plan: data.plan || 'Pro', // --- CORRECCIÓN: MAPEO DEL PLAN ---
                };
            });
            setCompanies(companyList);
        } catch (error) {
            console.error("Error fetching companies:", error);
            addToast('Error al cargar la lista de compañías.', 'error');
            logout(); 
        } finally {
            setLoading(false);
        }
    };

    const toggleCompanyStatus = async (company: Company) => {
        if (isUpdating) return;
        setIsUpdating(true);

        const newStatus = company.status === 'Activo' ? 'Inactivo' : 'Activo';
        const companyRef = doc(db, "companies", company.id);

        try {
            await updateDoc(companyRef, { 'status': newStatus });
            setCompanies(prevCompanies => 
                prevCompanies.map(c => 
                    c.id === company.id ? { ...c, status: newStatus } : c
                )
            );
            addToast(`Compañía "${company.name}" actualizada a: ${newStatus}`, 'success');
        } catch (error) {
            console.error("Error toggling company status:", error);
            addToast('Error al actualizar el estado de la compañía.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingCompany(null); 
        setIsFormVisible(true);
    };

    const handleOpenEdit = (company: Company) => {
        setEditingCompany(company); 
        setIsFormVisible(true);
    };

    const handleFormSaved = () => {
        fetchCompanies(); 
    };


    useEffect(() => {
        fetchCompanies();
    }, []);

    if (showRoadmap) {
        return <DevRoadmap onClose={() => setShowRoadmap(false)} />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
                Cargando datos...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-300 p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-white">🌎 Panel de Gestión de Compañías Administradoras</h1>
                <div className="flex space-x-4">
                    <button 
                        onClick={handleOpenCreate} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        [+] Añadir Compañía
                    </button>
                    <button 
                        onClick={logout} 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                    >
                        [Cerrar Sesión]
                    </button>
                </div>
            </header>

            <p className="text-lg text-neutral-400 mb-6">
                Gestión centralizada de sus clientes SaaS (Compañías).
            </p>

            {companies.length === 0 ? (
                <div className="text-center py-10 bg-neutral-900 rounded-lg">
                    No hay compañías registradas.
                    <button 
                        onClick={handleOpenCreate} 
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Añadir la primera Compañía
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto bg-neutral-900 rounded-lg shadow-xl">
                    <table className="min-w-full divide-y divide-neutral-700">
                        <thead className="bg-neutral-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    Compañía
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    Admin Principal
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    Facturación
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-neutral-850 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                        <div className="flex items-center">
                                            {company.logoUrl ? (
                                                <img src={company.logoUrl} alt={`${company.name} Logo`} className="w-10 h-10 object-contain rounded-full bg-white p-1 mr-4" />
                                            ) : (
                                                <div className="w-10 h-10 flex items-center justify-center bg-neutral-700 rounded-full mr-4">
                                                    [B]
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-white font-semibold">{company.name}</div>
                                                <div className="text-neutral-500 text-xs">RNC: {company.rnc}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                        <div className="text-sm">{company.adminUserEmail}</div>
                                        <div className="text-neutral-500 text-xs">{company.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                        <div className="text-sm">Inicia: {company.billingStartDate}</div>
                                        <div className="text-neutral-500 text-xs">{company.gracePeriodDays} días de gracia</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span 
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                company.status === 'Activo' ? 'bg-green-600/20 text-green-400' :
                                                company.status === 'Gracia' ? 'bg-yellow-600/20 text-yellow-400' :
                                                'bg-red-600/20 text-red-400'
                                            }`}
                                        >
                                            {company.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => handleOpenEdit(company)}
                                            className="py-1 px-3 rounded text-white text-xs font-bold transition-colors bg-neutral-600 hover:bg-neutral-700"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            className="py-1 px-3 rounded text-white text-xs font-bold transition-colors bg-blue-600 hover:bg-blue-700"
                                        >
                                            Ver Clientes
                                        </button>
                                        <button
                                            onClick={() => toggleCompanyStatus(company)}
                                            disabled={isUpdating}
                                            className={`py-1 px-3 rounded text-white text-xs font-bold transition-colors ${
                                                company.status === 'Activo' 
                                                    ? 'bg-red-600 hover:bg-red-700' 
                                                    : 'bg-green-600 hover:bg-green-700'
                                            }`}
                                        >
                                            {isUpdating ? '...' : company.status === 'Activo' ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <CompanyForm 
                isOpen={isFormVisible} 
                onClose={() => setIsFormVisible(false)} 
                onCompanySaved={handleFormSaved}
                defaultValues={editingCompany}
            />
        </div>
    );
};



