import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useMemberStore = create(
  persist(
    (set) => ({
      member: null,
      accessToken: null,

      login: (loginData) =>
        set({
          member: {
            email: loginData.email,
            nickname: loginData.nickname,
            profileImage: loginData.profileImage,
            social: loginData.social,
          },
          accessToken: loginData.accessToken,
        }),

      logout: () =>
        set({
          member: null,
          accessToken: null,
        }),

      updateMember: (memberData) =>
        set((state) => ({
          member: {
            ...state.member,
            ...memberData,
          },
        })),
    }),
    {
      name: 'tastemap-member-storage',
    }
  )
);

export default useMemberStore;
