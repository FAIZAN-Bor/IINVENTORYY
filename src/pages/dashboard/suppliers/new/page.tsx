import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Party } from '../../../../types';

export default function NewSupplierPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    ntn: '',
    strn: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validation - only name is required
    if (!formData.name.trim()) {
      alert('Supplier name is required');
      return;
    }

    // Load existing parties (suppliers are stored in the same collection)
    const savedParties = localStorage.getItem('parties');
    const parties: Party[] = savedParties ? JSON.parse(savedParties) : [];

    // Get next supplier number - find max among suppliers only, then add 1
    const maxSupplierNumber = parties
      .filter(p => p.type === 'supplier')
      .reduce((max, p) => Math.max(max, p.partyNumber || 0), 0);

    const nextSupplierNumber = maxSupplierNumber + 1;

    // Create new supplier (with type='supplier')
    const newSupplier: any = {
      id: Date.now().toString(),
      partyNumber: nextSupplierNumber,
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      cnic: undefined,
      ntn: formData.ntn.trim() || undefined,
      strn: formData.strn.trim() || undefined,
      creditLimit: 0,
      openingBalance: 0,
      currentBalance: 0,
      totalPurchases: 0,
      totalPayments: 0,
      status: formData.status,
      createdDate: new Date().toISOString().split('T')[0],
      notes: formData.notes.trim() || undefined,
      type: 'supplier', // Key difference: mark as supplier
    };

    // Save to localStorage
    parties.push(newSupplier);
    localStorage.setItem('parties', JSON.stringify(parties));

    // Show success message
    alert('Supplier added successfully!');
    navigate('/dashboard/suppliers');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Supplier</h1>
          <p className="text-gray-600 mt-1">Enter supplier details below</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/suppliers')}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
        >
          Back to Suppliers
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Supplier Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Supplier Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="03XX-XXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  NTN Number
                </label>
                <input
                  type="text"
                  name="ntn"
                  value={formData.ntn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter NTN number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  STRN Number
                </label>
                <input
                  type="text"
                  name="strn"
                  value={formData.strn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter STRN number (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Additional Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Any additional notes or comments..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            >
              Save Supplier
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard/suppliers')}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
