import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BasicLayout from '../../layouts/BasicLayout';
import useMemberStore from '../../store/useMemberStore';
import { deleteMyAccount, modifyMyInfo } from '../../api/myApi';
import AlertModal from '../../components/common/AlertModal';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';
import memberIcon from '../../assets/memberIcon.png';

const API_FILE_URL = 'http://localhost:8080/api/files';

const ModifyMemberPage = () => {
  const navigate = useNavigate();
  const { member, updateMember, logout } = useMemberStore();

  const emailParts = member?.email?.split('@') || ['', ''];
  const [emailId] = useState(emailParts[0]);
  const [emailDomain, setEmailDomain] = useState(emailParts[1] || '');

  const getInitialProfilePreview = () => {
    if (!member?.profileImage || member.profileImage === 'memberIcon.png') {
      return memberIcon;
    }

    return `${API_FILE_URL}/${member.profileImage}`;
  };

  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(
    getInitialProfilePreview()
  );

  const [form, setForm] = useState({
    nickname: member?.nickname || '',
    password: '',
    notes: '',
  });

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
    callbackFn: null,
  });

  const openModal = (type, message, callbackFn = null) => {
    setModal({
      open: true,
      type,
      message,
      callbackFn,
    });
  };

  const closeModal = () => {
    const callback = modal.callbackFn;

    setModal({
      open: false,
      type: 'info',
      message: '',
      callbackFn: null,
    });

    if (callback) {
      callback();
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleClickModify = async () => {
    if (!form.nickname) {
      openModal('info', '닉네임을 입력해주세요.');
      return;
    }

    try {
      const formData = new FormData();

      formData.append('nickname', form.nickname);
      formData.append('password', form.password);

      if (profileFile) {
        formData.append('profileImage', profileFile);
      }

      const data = await modifyMyInfo(formData);

      updateMember(data);

      openModal('success', '회원 정보가 수정되었습니다.', () =>
        navigate('/member/mypage')
      );
    } catch (error) {
      console.log('회원 정보 수정 실패:', error);
      console.log('응답 데이터:', error.response?.data);

      openModal('error', '회원 정보 수정에 실패했습니다.');
    }
  };

  const handleClickDelete = async () => {
    const result = window.confirm(
      '정말 회원 탈퇴하시겠습니까? 탈퇴 후에는 계정 복구가 어렵습니다.'
    );

    if (!result) return;

    try {
      await deleteMyAccount();

      openModal('success', '회원 탈퇴가 완료되었습니다.', () => {
        logout();
        navigate('/');
      });
    } catch (error) {
      console.log('회원 탈퇴 실패:', error);
      console.log('응답 데이터:', error.response?.data);

      openModal('error', '회원 탈퇴에 실패했습니다.');
    }
  };

  if (!member) {
    return (
      <BasicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-gray-600">로그인이 필요합니다.</p>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
        />
      )}

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="border-2 border-black bg-white p-8 shadow-[6px_6px_0_0] shadow-black">
          <h2 className="text-3xl font-black text-black">회원 정보 수정</h2>

          <p className="mt-2 text-sm text-gray-500">
            회원 정보를 수정하거나 계정을 탈퇴할 수 있습니다.
          </p>

          <div className="mt-8 space-y-6">
            <ProfileImageUpload
              preview={profilePreview}
              onChange={handleProfileChange}
            />

            <label htmlFor="EmailId" className="block text-black">
              <span className="text-sm font-semibold">Email</span>

              <div className="mt-0.5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <input
                  type="text"
                  id="EmailId"
                  value={emailId}
                  disabled
                  className="w-full border-2 border-black bg-gray-100 px-3 py-2 text-gray-500 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                />

                <span className="font-bold text-black">@</span>

                <select
                  name="emailDomain"
                  id="EmailDomain"
                  value={emailDomain}
                  disabled
                  onChange={(e) => setEmailDomain(e.target.value)}
                  className="w-full border-2 border-black bg-gray-100 px-3 py-2 text-gray-500 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 sm:text-sm"
                >
                  <option value={emailDomain}>{emailDomain}</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="kakao.com">kakao.com</option>
                  <option value="outlook.com">outlook.com</option>
                </select>
              </div>
            </label>

            <label htmlFor="Nickname" className="block text-black">
              <span className="text-sm font-semibold">Nickname</span>

              <input
                type="text"
                id="Nickname"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
              />
            </label>

            {!member.social && (
              <label htmlFor="Password" className="block text-black">
                <span className="text-sm font-semibold">New Password</span>

                <input
                  type="password"
                  id="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="변경할 비밀번호를 입력하세요"
                  className="mt-0.5 w-full border-2 border-black bg-white px-3 py-2 placeholder:text-gray-400 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
                />
              </label>
            )}

            <label htmlFor="Notes" className="block text-black">
              <span className="text-sm font-semibold">Notes</span>

              <textarea
                id="Notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="자기소개나 메모를 입력하세요."
                className="mt-0.5 w-full resize-none border-2 border-black bg-white px-3 py-2 shadow-[4px_4px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 sm:text-sm"
                rows="4"
              />
            </label>

            <div className="pt-4">
              <p className="text-sm font-semibold text-gray-500">가입 방식</p>
              <p className="mt-1 font-bold text-black">
                {member.social ? '카카오 로그인' : '일반 회원'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/member/mypage')}
                className="border-2 border-black bg-white px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleClickModify}
                className="border-2 border-black bg-yellow-200 px-5 py-3 font-semibold text-black shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                저장
              </button>

              <button
                type="button"
                onClick={handleClickDelete}
                className="ml-auto border-2 border-black bg-red-100 px-5 py-3 font-semibold text-red-900 shadow-[4px_4px_0_0] shadow-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none focus:ring-2 focus:ring-yellow-300 focus:outline-0"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default ModifyMemberPage;
