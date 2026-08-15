import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetProfileQuery, useUpdateProfileMutation } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { AvatarUpload, CoverUpload } from '../components/user/Uploads';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  fullName: yup.string().max(50, 'At most 50 characters'),
  bio: yup.string().max(160, 'At most 160 characters'),
  location: yup.string().max(100, 'At most 100 characters'),
  website: yup.string().url('Enter a valid URL'),
  gender: yup.string().oneOf(['male', 'female', 'other', 'prefer_not_to_say']),
  dob: yup
    .string()
    .nullable()
    .test('is-past', 'Date of birth must be in the past', (v) => !v || new Date(v) < new Date()),
});

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const EditProfile = () => {
  const { username: urlUsername } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const username = urlUsername || me?.username;

  const { data, isLoading } = useGetProfileQuery(username);
  const profile = data?.data?.user;
  const isOwn = me && profile && String(me._id) === String(profile._id);

  const [updateProfile] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: profile?.fullName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      gender: profile?.gender || '',
      dob: profile?.dob ? new Date(profile.dob).toISOString().slice(0, 10) : '',
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isOwn) {
    return (
      <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
        <p className="text-sm text-rose-500">You can only edit your own profile.</p>
        <Link to={`/u/${username}`} className="mt-4 inline-block">
          <Button variant="secondary" size="sm">Back to profile</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (values) => {
    const payload = {
      fullName: values.fullName || null,
      bio: values.bio || null,
      location: values.location || null,
      website: values.website || null,
      gender: values.gender || null,
      dob: values.dob ? new Date(values.dob).toISOString() : null,
    };
    try {
      const res = await updateProfile(payload).unwrap();
      toast.success(res?.message || 'Profile updated!');
      navigate(`/u/${username}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Update failed'));
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-500">@{username}</p>
        </div>
        <Link to={`/u/${username}`}>
          <Button variant="ghost" size="sm">Cancel</Button>
        </Link>
      </div>

      <div className="glass-strong space-y-6 rounded-3xl p-6 animate-fade-up sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <CoverUpload
            coverPhoto={profile.coverPhoto}
            onDone={() => reset({}, { keepValues: true })}
          />
          <AvatarUpload
            avatar={profile.avatar}
            onDone={() => reset({}, { keepValues: true })}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Full name" placeholder="Your display name" error={errors.fullName?.message} {...register('fullName')} />
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell people about yourself"
              className="input-base resize-none"
              {...register('bio')}
            />
            {errors.bio?.message && <p className="mt-1.5 text-xs font-medium text-rose-500">{errors.bio.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Location" placeholder="City, Country" error={errors.location?.message} {...register('location')} />
            <Input label="Website" placeholder="https://..." error={errors.website?.message} {...register('website')} />
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Gender</label>
              <select className="input-base cursor-pointer" {...register('gender')}>
                <option value="">Prefer not to say</option>
                {genderOptions.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <Input label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to={`/u/${username}`}>
              <Button variant="ghost" type="button" size="md">Cancel</Button>
            </Link>
            <Button type="submit" loading={isSubmitting} size="md">
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
