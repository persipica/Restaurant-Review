import { useEffect, useState } from 'react';
import useMemberStore from '../../store/useMemberStore';
import memberIcon from '../../assets/memberIcon.png';
import AlertModal from '../common/AlertModal';
import {
  addComment,
  deleteComment,
  getCommentList,
  modifyComment,
} from '../../api/commentApi';

const API_FILE_URL = 'http://localhost:8080/api/files';

const formatDate = (dateString) => {
  if (!dateString) return '';

  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getProfileImageUrl = (profileImage) => {
  if (!profileImage || profileImage === 'memberIcon.png') {
    return memberIcon;
  }

  return `${API_FILE_URL}/${profileImage}`;
};

const CommentItem = ({
  comment,
  member,
  isReply = false,
  openedReplies,
  toggleReplies,
  replyTarget,
  setReplyTarget,
  replyContent,
  setReplyContent,
  handleAddReply,
  editTarget,
  setEditTarget,
  editContent,
  setEditContent,
  handleModifyComment,
  requestDeleteComment,
}) => {
  const isOwner = member && member.email === comment.writerEmail;
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const isRepliesOpened = openedReplies[comment.cno];

  return (
    <div
      className={`border-2 border-black bg-white p-4 shadow-[4px_4px_0_0] shadow-black ${
        isReply ? 'ml-6 bg-yellow-50' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-black bg-white shadow-[2px_2px_0_0] shadow-black">
            <img
              src={getProfileImageUrl(comment.writerProfileImage)}
              alt="댓글 작성자 아이콘"
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = memberIcon;
              }}
            />
          </div>

          <div>
            <p className="font-black text-black">
              {comment.writerNickname || '알 수 없음'}
            </p>

            <p className="mt-1 text-xs font-semibold text-gray-500">
              {formatDate(comment.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditTarget(comment.cno);
                  setEditContent(comment.content);
                }}
                className="border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0_0] shadow-black"
              >
                수정
              </button>

              <button
                type="button"
                onClick={() => requestDeleteComment(comment.cno)}
                className="border-2 border-black bg-red-100 px-3 py-1 text-xs font-bold text-red-900 shadow-[2px_2px_0_0] shadow-black"
              >
                삭제
              </button>
            </>
          ) : (
            !isReply && (
              <button
                type="button"
                onClick={() => {
                  setReplyTarget(comment.cno);
                  setReplyContent('');
                }}
                className="border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black shadow-[2px_2px_0_0] shadow-black"
              >
                답글
              </button>
            )
          )}
        </div>
      </div>

      {editTarget === comment.cno ? (
        <div className="mt-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
            className="w-full resize-none border-2 border-black bg-white p-3 text-sm shadow-[3px_3px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleModifyComment(comment.cno)}
              className="border-2 border-black bg-teal-500 px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0] shadow-black"
            >
              저장
            </button>

            <button
              type="button"
              onClick={() => {
                setEditTarget(null);
                setEditContent('');
              }}
              className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {comment.content}
        </p>
      )}

      {replyTarget === comment.cno && (
        <div className="mt-4 border-2 border-black bg-yellow-50 p-4">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="3"
            placeholder="답글을 입력하세요"
            className="w-full resize-none border-2 border-black bg-white p-3 text-sm shadow-[3px_3px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0"
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => handleAddReply(comment.cno)}
              className="border-2 border-black bg-yellow-200 px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black"
            >
              답글 등록
            </button>

            <button
              type="button"
              onClick={() => {
                setReplyTarget(null);
                setReplyContent('');
              }}
              className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {hasReplies && !isReply && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => toggleReplies(comment.cno)}
            className="flex items-center gap-2 text-sm font-black text-black"
          >
            <span>{isRepliesOpened ? '▼' : '▶'}</span>
            <span>답글 {replies.length}개</span>
          </button>

          {isRepliesOpened && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.cno}
                  comment={reply}
                  member={member}
                  isReply
                  openedReplies={openedReplies}
                  toggleReplies={toggleReplies}
                  replyTarget={replyTarget}
                  setReplyTarget={setReplyTarget}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleAddReply={handleAddReply}
                  editTarget={editTarget}
                  setEditTarget={setEditTarget}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  handleModifyComment={handleModifyComment}
                  requestDeleteComment={requestDeleteComment}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RestaurantCommentSection = ({ rno }) => {
  const { member } = useMemberStore();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({
    totalPages: 1,
    totalCount: 0,
    hasPrev: false,
    hasNext: false,
  });

  const [openedReplies, setOpenedReplies] = useState({});
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [modal, setModal] = useState({
    open: false,
    type: 'info',
    message: '',
    onConfirm: null,
  });

  const closeModal = () => {
    setModal({
      open: false,
      type: 'info',
      message: '',
      onConfirm: null,
    });
  };

  const openInfoModal = (message) => {
    setModal({
      open: true,
      type: 'info',
      message,
      onConfirm: null,
    });
  };

  const openErrorModal = (message) => {
    setModal({
      open: true,
      type: 'error',
      message,
      onConfirm: null,
    });
  };

  const openSuccessModal = (message) => {
    setModal({
      open: true,
      type: 'success',
      message,
      onConfirm: null,
    });
  };

  const fetchComments = async (targetPage = page) => {
    try {
      const data = await getCommentList(rno, targetPage, 10);

      setComments(data.list || []);
      setPageInfo({
        totalPages: data.totalPages || 1,
        totalCount: data.totalCount || 0,
        hasPrev: data.hasPrev || false,
        hasNext: data.hasNext || false,
      });
    } catch (error) {
      console.log('댓글 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchComments(page);
  }, [rno, page]);

  const handleAddComment = async () => {
    if (!member) {
      openInfoModal('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }

    if (!content.trim()) {
      openInfoModal('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      await addComment(rno, {
        content,
      });

      setContent('');
      setPage(1);
      fetchComments(1);
    } catch (error) {
      console.log('댓글 등록 실패:', error);
      openErrorModal('댓글 등록에 실패했습니다.');
    }
  };

  const handleAddReply = async (parentCno) => {
    if (!member) {
      openInfoModal('로그인 후 답글을 작성할 수 있습니다.');
      return;
    }

    if (!replyContent.trim()) {
      openInfoModal('답글 내용을 입력해주세요.');
      return;
    }

    try {
      await addComment(rno, {
        content: replyContent,
        parentCno,
      });

      setReplyTarget(null);
      setReplyContent('');
      setOpenedReplies((prev) => ({
        ...prev,
        [parentCno]: true,
      }));

      fetchComments(page);
    } catch (error) {
      console.log('답글 등록 실패:', error);
      openErrorModal('답글 등록에 실패했습니다.');
    }
  };

  const handleModifyComment = async (cno) => {
    if (!editContent.trim()) {
      openInfoModal('수정할 내용을 입력해주세요.');
      return;
    }

    try {
      await modifyComment(rno, cno, {
        content: editContent,
      });

      setEditTarget(null);
      setEditContent('');

      fetchComments(page);
    } catch (error) {
      console.log('댓글 수정 실패:', error);
      openErrorModal('댓글 수정에 실패했습니다.');
    }
  };

  const requestDeleteComment = (cno) => {
    setModal({
      open: true,
      type: 'info',
      message: '댓글을 삭제하시겠습니까?',
      onConfirm: () => handleDeleteComment(cno),
    });
  };

  const handleDeleteComment = async (cno) => {
    try {
      await deleteComment(rno, cno);

      closeModal();

      const nextPage = comments.length === 1 && page > 1 ? page - 1 : page;

      setPage(nextPage);
      fetchComments(nextPage);

      openSuccessModal('댓글이 삭제되었습니다.');
    } catch (error) {
      console.log('댓글 삭제 실패:', error);
      closeModal();
      openErrorModal('댓글 삭제에 실패했습니다.');
    }
  };

  const toggleReplies = (cno) => {
    setOpenedReplies((prev) => ({
      ...prev,
      [cno]: !prev[cno],
    }));
  };

  const getPageNumbers = () => {
    const totalPages = pageInfo.totalPages || 1;
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    const nums = [];

    for (let i = start; i <= end; i++) {
      nums.push(i);
    }

    return nums;
  };

  return (
    <section className="mt-10 border-2 border-black bg-white p-6 shadow-[6px_6px_0_0] shadow-black">
      {modal.open && (
        <AlertModal
          type={modal.type}
          message={modal.message}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          confirmLabel="삭제"
          cancelLabel="취소"
        />
      )}

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-block border-2 border-black bg-yellow-200 px-3 py-1 text-xs font-black text-black shadow-[3px_3px_0_0] shadow-black">
            COMMENTS
          </div>

          <h3 className="mt-4 text-2xl font-black text-black">댓글</h3>

          <p className="mt-2 text-sm font-semibold text-gray-500">
            총 {pageInfo.totalCount}개의 댓글이 있습니다.
          </p>
        </div>
      </div>

      <div className="mb-8 border-2 border-black bg-yellow-50 p-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          placeholder={
            member
              ? '댓글을 입력하세요'
              : '로그인 후 댓글을 작성할 수 있습니다.'
          }
          disabled={!member}
          className="w-full resize-none border-2 border-black bg-white p-3 text-sm shadow-[3px_3px_0_0] shadow-black focus:ring-2 focus:ring-yellow-300 focus:outline-0 disabled:bg-gray-100"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleAddComment}
            disabled={!member}
            className="border-2 border-black bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-[3px_3px_0_0] shadow-black disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            댓글 등록
          </button>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="border-2 border-black bg-gray-50 p-8 text-center">
          <p className="font-semibold text-gray-500">
            아직 작성된 댓글이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <CommentItem
              key={comment.cno}
              comment={comment}
              member={member}
              openedReplies={openedReplies}
              toggleReplies={toggleReplies}
              replyTarget={replyTarget}
              setReplyTarget={setReplyTarget}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleAddReply={handleAddReply}
              editTarget={editTarget}
              setEditTarget={setEditTarget}
              editContent={editContent}
              setEditContent={setEditContent}
              handleModifyComment={handleModifyComment}
              requestDeleteComment={requestDeleteComment}
            />
          ))}
        </div>
      )}

      {pageInfo.totalPages > 1 && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            이전
          </button>

          {getPageNumbers().map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              className={`border-2 border-black px-4 py-2 text-sm font-bold shadow-[3px_3px_0_0] shadow-black ${
                page === num
                  ? 'bg-yellow-200 text-black'
                  : 'bg-white text-black'
              }`}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= pageInfo.totalPages}
            onClick={() => setPage(page + 1)}
            className="border-2 border-black bg-white px-4 py-2 text-sm font-bold text-black shadow-[3px_3px_0_0] shadow-black disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            다음
          </button>
        </div>
      )}
    </section>
  );
};

export default RestaurantCommentSection;
