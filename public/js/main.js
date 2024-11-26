// /public/js/main.js

document.addEventListener('DOMContentLoaded', function() {
  const dragDropArea = document.getElementById('drag-drop-area');
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const uploadForm = document.getElementById('upload-form');

  let selectedFiles = null;
  let uploadedFileIds = [];

  // 페이지 로드 시 비밀키 확인 또는 발급
  checkOrGenerateSecretKey();

  // 드래그 앤 드롭 이벤트 처리
  dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('dragging');
  });

  dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragging');
  });

  dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('dragging');
    selectedFiles = e.dataTransfer.files;
    fileInput.files = selectedFiles;
    uploadFiles();
  });

  dragDropArea.addEventListener('click', () => {
    fileInput.click();
  });

  // 파일 선택 시 파일 변수 업데이트
  fileInput.addEventListener('change', function() {
    selectedFiles = fileInput.files;
    if (selectedFiles.length > 0) {
      uploadFiles();
    }
  });

  // 업로드 버튼 클릭 시 업로드 진행
  uploadBtn.addEventListener('click', () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '업로드할 파일을 선택하세요.',
      });
      return;
    }

    uploadFiles();
  });

  // 파일 업로드 함수
  function uploadFiles() {
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('file', selectedFiles[i]);
    }

    // AJAX를 사용한 파일 업로드
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        uploadedFileIds = data.files.map(file => file._id);
        showUploadedFilesModal(data.files);
      } else {
        Swal.fire({
          icon: 'error',
          title: '업로드 실패',
          text: data.message || '파일 업로드 중 오류가 발생했습니다.',
        });
      }
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '업로드 실패',
        text: '파일 업로드 중 오류가 발생했습니다.',
      });
    });
  }

  // 업로드된 파일 목록을 보여주는 SweetAlert 모달
  function showUploadedFilesModal(files) {
    let fileListHtml = '<ul style="text-align: left; list-style: none; padding: 0;">';
    files.forEach(file => {
      fileListHtml += `
        <li style="margin-bottom: 10px;">
          <i class="material-icons" style="vertical-align: middle;">insert_drive_file</i>
          <span style="margin-left: 10px; vertical-align: middle;">${file.originalname} (${getFileExtension(file.originalname)})</span>
        </li>
      `;
    });
    fileListHtml += '</ul>';

    Swal.fire({
      title: '파일 업로드 완료',
      html: `
        <div style="text-align: left;">
          다음 파일이 성공적으로 업로드되었습니다.<br><br>
          ${fileListHtml}
        </div>
      `,
      icon: 'success',
      showCancelButton: false,
      confirmButtonText: '비밀키 입력',
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        promptSecretKey();
      }
    });
  }

  // 비밀키 입력 SweetAlert 모달
  function promptSecretKey() {
    Swal.fire({
      title: '비밀키 입력',
      text: '비밀키를 입력하여 파일을 안전하게 저장하십시오.',
      input: 'text',
      inputLabel: '비밀키',
      inputPlaceholder: '비밀키를 입력하세요',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      inputValidator: (value) => {
        if (!value) {
          return '비밀키를 입력해야 합니다!';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const key = result.value.trim();
        if (key.length === 0) {
          Swal.fire({
            icon: 'error',
            title: '비밀키 오류',
            text: '비밀키는 비워둘 수 없습니다.',
          });
          return;
        }
        assignSecretKey(key);
      }
    });
  }

  // 비밀키를 서버에 할당하는 함수
  function assignSecretKey(key) {
    fetch('/assign-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secretKey: key,
        fileIds: uploadedFileIds,
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: '비밀키 할당 완료',
          text: '파일이 비밀키와 함께 저장되었습니다.',
        });
        // 변수 초기화
        uploadedFileIds = [];
        selectedFiles = null;
        fileInput.value = '';
      } else {
        Swal.fire({
          icon: 'error',
          title: '비밀키 할당 실패',
          text: data.message || '비밀키 할당 중 오류가 발생했습니다.',
        });
      }
    })
    .catch(error => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '비밀키 할당 실패',
        text: '비밀키 할당 중 오류가 발생했습니다.',
      });
    });
  }

  // UUID 생성 함수 (사용하지 않음, 비밀키는 사용자가 입력)
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 파일 확장자 추출 함수
  function getFileExtension(filename) {
    return filename.split('.').pop();
  }

  // 초기 비밀키 생성 및 복사 기능
  function checkOrGenerateSecretKey() {
    if (!localStorage.getItem('secretKey')) {
      Swal.fire({
        title: '비밀키 발급',
        html: `
          <p>비밀키를 분실 시 파일을 찾을 수 없습니다.</p>
          <button id="copyKeyBtn" class="swal2-confirm swal2-styled">비밀키 복사하기</button>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          const copyBtn = Swal.getPopup().querySelector('#copyKeyBtn');
          const secretKey = generateUUID();

          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(secretKey).then(() => {
              localStorage.setItem('secretKey', secretKey);
              Swal.fire({
                icon: 'success',
                title: '비밀키 복사 완료',
                text: '비밀키가 클립보드에 복사되었습니다.',
                confirmButtonText: '확인',
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
            }).catch(() => {
              Swal.fire({
                icon: 'error',
                title: '비밀키 복사 실패',
                text: '비밀키 복사에 실패했습니다. 수동으로 복사해 주세요.',
                confirmButtonText: '확인',
                allowOutsideClick: false,
                allowEscapeKey: false,
              });
            });
          });
        }
      });
    }
  }
});
