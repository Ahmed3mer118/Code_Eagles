import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { groupApi, teacherApi } from '../../shared/api/platformApi';
import PageHeader from '../../shared/ui/PageHeader';
import SearchInput from '../../shared/ui/SearchInput';
import StatusBadge from '../../shared/ui/StatusBadge';

export default function TeacherStudentsPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [groupId, setGroupId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupApi.list().then((data) => setGroups(data.groups || [])).catch(() => {});
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (groupId) params.groupId = groupId;
      if (search.trim()) params.q = search.trim();
      const data = await teacherApi.listStudents(params);
      setStudents(data.students || []);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [groupId]);

  const openProfile = async (student) => {
    setSelected(student);
    setProfile(null);
    try {
      const data = await teacherApi.getStudent(student._id);
      setProfile(data);
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  const toggleSuspend = async (student) => {
    const next = student.status === 'suspended' ? 'active' : 'suspended';
    try {
      await teacherApi.updateStudentStatus(student._id, next);
      toast.success(t('common.success'));
      loadStudents();
      if (selected?._id === student._id) openProfile({ ...student, status: next });
    } catch (err) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('students.title')} subtitle={t('students.subtitle')} />

      <div className="flex flex-wrap gap-3">
        <select className="ce-input max-w-xs" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">{t('results.allGroups')}</option>
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
        <SearchInput value={search} onChange={setSearch} placeholder={t('students.search')} className="max-w-sm" />
        <button type="button" className="ce-btn ce-btn-ghost" onClick={loadStudents}>{t('common.search')}</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="ce-card overflow-hidden">
          {loading ? (
            <p className="p-5 text-sm text-[var(--ce-muted)]">{t('common.loading')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[var(--ce-bg)]">
                <tr>
                  <th className="px-4 py-3 text-start">{t('students.name')}</th>
                  <th className="px-4 py-3 text-start">{t('students.phone')}</th>
                  <th className="px-4 py-3 text-start">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--ce-border)]">
                {students.map((student) => (
                  <tr key={student._id} className="cursor-pointer hover:bg-[var(--ce-bg)]" onClick={() => openProfile(student)}>
                    <td className="px-4 py-3 font-semibold">{student.name}</td>
                    <td className="px-4 py-3">{student.phone_number}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={student.status === 'active' ? 'approved' : 'pending'} label={student.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && profile && (
          <div className="ce-card space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--ce-primary)]">{profile.student?.name}</h2>
                <p className="text-sm text-[var(--ce-muted)]">{profile.student?.email}</p>
                <p className="text-sm">{profile.student?.phone_number}</p>
              </div>
              <button type="button" className="ce-btn ce-btn-ghost text-sm" onClick={() => toggleSuspend(profile.student)}>
                {profile.student?.status === 'suspended' ? t('students.activate') : t('students.suspend')}
              </button>
            </div>

            <section>
              <h3 className="font-bold">{t('students.groups')}</h3>
              <div className="mt-2 space-y-2">
                {(profile.enrollments || []).map((en) => (
                  <div key={en._id} className="rounded-xl bg-[var(--ce-bg)] p-3 text-sm">
                    {en.groupId?.name} — {en.groupId?.subjectId?.name}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="font-bold">{t('students.devices')}</h3>
              <p className="text-sm text-[var(--ce-muted)]">{t('students.deviceCount', { count: profile.deviceCount || 0 })}</p>
              <div className="mt-2 space-y-2">
                {(profile.devices || []).map((d) => (
                  <div key={d._id} className="rounded-xl bg-[var(--ce-bg)] p-3 text-xs">
                    {d.deviceType} · {d.browser} · {d.lastLoginAt ? new Date(d.lastLoginAt).toLocaleString() : '—'}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
