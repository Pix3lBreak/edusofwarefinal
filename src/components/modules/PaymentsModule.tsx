/**
 * Payments & Financial Management Module
 * With official PDF receipt generation, Excel export, and push payment reminders
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  FileDown, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send,
  X,
  Receipt,
  DollarSign,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentRecord, Student } from '../../types';
import { PDFGeneratorService } from '../../services/pdfGenerator';
import { ExcelExporterService } from '../../services/excelExporter';

export const PaymentsModule: React.FC = () => {
  const { 
    payments, 
    students, 
    config, 
    recordPayment, 
    triggerPushAlert, 
    currentUser,
    currentRole,
    canCollectPayments,
    setActiveModule,
    addToast 
  } = useApp();

  // ACCESS GUARD: Strict restriction
  // Only superadmin, director (administradores) and cajero (caja) can view or charge payments.
  if (!canCollectPayments) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-8 dark:border-red-900/40 dark:bg-red-950/20 max-w-lg shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-500/30 mb-4">
            <ShieldAlert className="h-9 w-9" />
          </div>
          <span className="inline-block rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-3 py-1 text-xs font-black uppercase tracking-wider mb-2">
            Control de Acceso • Rol: {currentRole.toUpperCase()}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
            Módulo Exclusivo de Administración y Caja
          </h2>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Por estrictas políticas de confidencialidad institucional, <strong>únicamente el personal de Administración y Caja</strong> está autorizado para consultar cobros, registrar pagos de mensualidades y emitir recibos. 
          </p>
          <div className="mt-4 p-3 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/40 text-[11px] text-red-700 dark:text-red-300 font-semibold">
            🚫 Los estudiantes, representantes y docentes no tienen permitido visualizar la facturación ni ejecutar cobros.
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActiveModule('dashboard')}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white px-5 py-2.5 text-xs font-bold transition-all shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Panel Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New payment form
  const [newPayment, setNewPayment] = useState<Partial<PaymentRecord>>({
    receiptNumber: `REC-2026-${String(payments.length + 1).padStart(4, '0')}`,
    studentId: students[0]?.id || '',
    concept: 'Pensión / Colegiatura Noviembre 2026',
    amount: 280,
    dueDate: new Date().toISOString().slice(0, 10),
    paidDate: new Date().toISOString().slice(0, 10),
    status: 'pagado',
    method: 'transferencia',
    referenceCode: '',
    cashierName: currentUser.name,
  });

  const studentMap = new Map(students.map(s => [s.id, s]));

  // Metrics
  const totalPaid = payments.filter(p => p.status === 'pagado').reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pendiente').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = payments.filter(p => p.status === 'vencido').reduce((acc, curr) => acc + curr.amount, 0);
  const collectionRate = totalPaid + totalPending + totalOverdue > 0 
    ? Math.round((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100) 
    : 100;

  const filteredPayments = payments.filter(p => {
    const student = studentMap.get(p.studentId);
    const matchesSearch = 
      p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.concept.toLowerCase().includes(search.toLowerCase()) ||
      (student && `${student.firstName} ${student.lastName}`.toLowerCase().includes(search.toLowerCase())) ||
      (student && student.code.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === 'todos' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.studentId || !newPayment.amount) {
      addToast('error', 'Campos requeridos', 'Selecciona un alumno y el importe a registrar.');
      return;
    }

    const paymentRecord: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: newPayment.receiptNumber || `REC-2026-${Date.now().toString().slice(-4)}`,
      studentId: newPayment.studentId,
      concept: newPayment.concept || 'Colegiatura Regular',
      amount: Number(newPayment.amount),
      dueDate: newPayment.dueDate || new Date().toISOString().slice(0, 10),
      paidDate: newPayment.status === 'pagado' ? newPayment.paidDate || new Date().toISOString().slice(0, 10) : undefined,
      status: (newPayment.status as any) || 'pagado',
      method: newPayment.method as any,
      referenceCode: newPayment.referenceCode,
      cashierName: currentUser.name,
      notes: newPayment.notes,
    };

    recordPayment(paymentRecord);
    setIsModalOpen(false);
  };

  const statusBadges = {
    pagado: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    pendiente: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    vencido: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white sm:text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" /> Control Financiero y Tesorería
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gestión centralizada de colegiaturas, cobranzas, emisión de recibos PDF y exportación contable a Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => ExcelExporterService.exportPayments(payments, students, config)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            Exportar Excel
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Emitir Recibo / Cobro
          </button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Total Recaudado (Cobrado)
          </span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {config.currencySymbol} {totalPaid.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold">{collectionRate}% de meta mensual</span>
        </div>

        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
            Por Vencer (Pendiente)
          </span>
          <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">
            {config.currencySymbol} {totalPending.toFixed(2)}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold">{payments.filter(p => p.status === 'pendiente').length} recibos pendientes</span>
        </div>

        <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
            Cartera Vencida (Morosos)
          </span>
          <p className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">
            {config.currencySymbol} {totalOverdue.toFixed(2)}
          </p>
          <span className="text-[11px] text-red-600 font-semibold">{payments.filter(p => p.status === 'vencido').length} cuotas en mora</span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Facturación Activa
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {config.currencySymbol} {(totalPaid + totalPending + totalOverdue).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-500">Ciclo {config.currentAcademicYear}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por número de recibo, estudiante o concepto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pagado">Pagados / Al Día</option>
            <option value="pendiente">Pendientes por Vencer</option>
            <option value="vencido">Vencidos / Morosos</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">N° Recibo</th>
                <th className="py-3 px-4">Estudiante / Tutor</th>
                <th className="py-3 px-4">Concepto Educativo</th>
                <th className="py-3 px-4 text-right">Importe</th>
                <th className="py-3 px-4 text-center">Vencimiento</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.map(p => {
                const student = studentMap.get(p.studentId);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {p.receiptNumber}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {student ? `${student.lastName}, ${student.firstName}` : 'Desconocido'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {student?.code} • Tutor: {student?.tutorName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.concept}
                      </span>
                      {p.referenceCode && (
                        <span className="block text-[10px] text-slate-400">Ref: {p.referenceCode}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                      {config.currencySymbol} {p.amount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-500">
                      {p.dueDate}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusBadges[p.status]}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Generate Receipt PDF */}
                        {student && (
                          <button
                            onClick={() => PDFGeneratorService.generatePaymentReceipt(p, student, config)}
                            title="Descargar Comprobante Oficial en PDF"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Receipt className="h-3.5 w-3.5" /> Recibo PDF
                          </button>
                        )}

                        {/* Push Reminder to Parent if Overdue */}
                        {p.status === 'vencido' && student && (
                          <button
                            onClick={() => {
                              triggerPushAlert(
                                `⚠️ Aviso de Vencimiento de Pensión`,
                                `Estimado apoderado ${student.tutorName}: Le recordamos que el concepto "${p.concept}" por ${config.currencySymbol}${p.amount.toFixed(2)} registra vencimiento. Agradecemos su pronta regularización en tesorería.`,
                                true
                              );
                            }}
                            title="Enviar notificación push de cobranza al tutor"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Send className="h-3 w-3" /> Recordar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreatePayment}
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
          >
            <div className="bg-emerald-700 p-5 text-white flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="h-5 w-5" /> Registrar Cobro / Emisión de Recibo
              </h3>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estudiante *</label>
                <select
                  value={newPayment.studentId}
                  onChange={e => setNewPayment({ ...newPayment, studentId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.lastName}, {s.firstName} ({s.code}) - {s.gradeId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Concepto Educativo *</label>
                <input
                  type="text"
                  required
                  value={newPayment.concept}
                  onChange={e => setNewPayment({ ...newPayment, concept: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="ej. Pensión Noviembre 2026, Matrícula Anual..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Monto ({config.currencySymbol}) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newPayment.amount}
                    onChange={e => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estado de Pago</label>
                  <select
                    value={newPayment.status}
                    onChange={e => setNewPayment({ ...newPayment, status: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="pagado">Pagado / Cancelado</option>
                    <option value="pendiente">Pendiente por Vencer</option>
                    <option value="vencido">Vencido / En Mora</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Método de Cobro</label>
                  <select
                    value={newPayment.method}
                    onChange={e => setNewPayment({ ...newPayment, method: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="efectivo">Efectivo (Caja)</option>
                    <option value="transferencia">Transferencia Bancaria</option>
                    <option value="tarjeta">Tarjeta Débito/Crédito</option>
                    <option value="deposito">Depósito en Ventanilla</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">N° Operación / Ref.</label>
                  <input
                    type="text"
                    value={newPayment.referenceCode || ''}
                    onChange={e => setNewPayment({ ...newPayment, referenceCode: e.target.value })}
                    placeholder="ej. OP-98214"
                    className="w-full rounded-xl border border-slate-300 p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-colors"
              >
                Guardar y Emitir
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
