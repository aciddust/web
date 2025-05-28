<script lang="ts">
  import { onMount } from 'svelte';
  import { RotateCcw, Shuffle, Download, Copy } from 'lucide-svelte';

  // 9x9 스도쿠 보드 (완전히 채워진 정답)
  let board: number[][] = [];
  let isGenerating = false;
  let generationCount = 0;

  // 배열을 무작위로 섞는 함수
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // 유효한 숫자인지 확인
  function isValidNumber(board: number[][], row: number, col: number, num: number): boolean {
    // 같은 행 검사
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === num) return false;
    }

    // 같은 열 검사
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === num) return false;
    }

    // 3x3 박스 검사
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      }
    }

    // 메인 대각선 검사 (왼쪽 위에서 오른쪽 아래)
    if (row === col) {
      for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][i] === num) return false;
      }
    }

    // 반대 대각선 검사 (오른쪽 위에서 왼쪽 아래)
    if (row + col === 8) {
      for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][8 - i] === num) return false;
      }
    }

    return true;
  }

  // 빈 셀 찾기
  function findEmptyCell(board: number[][]): { row: number; col: number } | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return { row, col };
        }
      }
    }
    return null;
  }

  // 백트래킹을 이용한 스도쿠 해결 (무작위 순서로)
  function solveSudokuRandomly(board: number[][]): boolean {
    const emptyCell = findEmptyCell(board);
    if (!emptyCell) {
      return true; // 완성
    }

    const { row, col } = emptyCell;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]); // 숫자 순서를 무작위로

    for (const num of numbers) {
      if (isValidNumber(board, row, col, num)) {
        board[row][col] = num;

        if (solveSudokuRandomly(board)) {
          return true;
        }

        board[row][col] = 0; // 백트래킹
      }
    }

    return false;
  }

  // 완전히 무작위 스도쿠 생성
  async function generateRandomSudoku(): Promise<number[][]> {
    // 빈 보드부터 시작
    const newBoard: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

    // 무작위로 해결
    if (solveSudokuRandomly(newBoard)) {
      return newBoard;
    }

    // 실패하면 재시도 (거의 발생하지 않음)
    return generateRandomSudoku();
  }

  // 대각선 제약이 있는 경우 행/열 섞기를 제한적으로 적용
  function applyAdditionalRandomization(board: number[][]): number[][] {
    // 대각선 스도쿠에서는 행/열 섞기가 대각선을 깨뜨릴 수 있으므로
    // 추가 무작위화를 적용하지 않고 원본 보드를 그대로 반환
    return board.map(row => [...row]);
  }

  // 대각선 유효성 검증 함수 추가
  function validateDiagonals(board: number[][]): boolean {
    // 메인 대각선 검증
    const mainDiag = [];
    for (let i = 0; i < 9; i++) {
      mainDiag.push(board[i][i]);
    }
    const mainDiagSet = new Set(mainDiag);
    if (mainDiagSet.size !== 9 || !Array.from(mainDiagSet).every(n => n >= 1 && n <= 9)) {
      return false;
    }

    // 반대 대각선 검증
    const antiDiag = [];
    for (let i = 0; i < 9; i++) {
      antiDiag.push(board[i][8 - i]);
    }
    const antiDiagSet = new Set(antiDiag);
    if (antiDiagSet.size !== 9 || !Array.from(antiDiagSet).every(n => n >= 1 && n <= 9)) {
      return false;
    }

    return true;
  }

  // 새로운 정답 생성
  async function generateNewAnswer() {
    if (isGenerating) return;

    isGenerating = true;
    generationCount++;

    try {
      let attempts = 0;
      let newBoard;
      
      do {
        // 기본 무작위 생성
        newBoard = await generateRandomSudoku();
        attempts++;
        
        // 너무 많이 시도하면 중단
        if (attempts > 100) {
          console.warn('대각선 조건을 만족하는 스도쿠 생성에 실패했습니다. 재시도합니다.');
          break;
        }
      } while (!validateDiagonals(newBoard));

      // 대각선 검증 통과한 보드만 사용
      if (validateDiagonals(newBoard)) {
        board = newBoard;
        console.log('대각선 스도쿠 생성 성공! 시도 횟수:', attempts);
      } else {
        console.error('유효한 대각선 스도쿠 생성 실패');
        // 실패 시 재귀 호출로 다시 시도
        setTimeout(() => {
          isGenerating = false;
          generateNewAnswer();
        }, 100);
        return;
      }
    } catch (error) {
      console.error('정답 생성 중 오류:', error);
    } finally {
      isGenerating = false;
    }
  }

  // 보드를 텍스트로 변환
  function boardToText(): string {
    return board.map(row => row.join(' ')).join('\n');
  }

  // 클립보드에 복사
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(boardToText());
      alert('스도쿠 정답이 클립보드에 복사되었습니다!');
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      alert('클립보드 복사에 실패했습니다.');
    }
  }

  // 파일로 다운로드
  function downloadAsFile() {
    const text = boardToText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `sudoku-answer-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // 보드의 셀 스타일 결정
  function getCellClass(row: number, col: number): string {
    let classes = 'flex items-center justify-center font-bold border border-gray-400 ';
    classes += 'aspect-square '; // 정사각형 비율 유지
    classes += 'text-sm sm:text-base md:text-lg '; // 9x9에 맞는 반응형 텍스트 크기
    
    // 대각선 셀 스타일링
    const isMainDiagonal = row === col;
    const isAntiDiagonal = row + col === 8;
    
    if (isMainDiagonal && isAntiDiagonal) {
      // 중앙 교차점 (4,4)
      classes += 'bg-purple-100 text-purple-800 ';
    } else if (isMainDiagonal) {
      // 메인 대각선
      classes += 'bg-blue-100 text-blue-800 ';
    } else if (isAntiDiagonal) {
      // 반대 대각선
      classes += 'bg-green-100 text-green-800 ';
    } else {
      // 일반 셀
      classes += 'bg-white text-gray-800 ';
    }

    // 3x3 박스 구분을 위한 굵은 테두리
    if (row % 3 === 0) classes += 'border-t-2 border-t-gray-600 ';
    if (col % 3 === 0) classes += 'border-l-2 border-l-gray-600 ';
    if (row === 8) classes += 'border-b-2 border-b-gray-600 ';
    if (col === 8) classes += 'border-r-2 border-r-gray-600 ';

    return classes;
  }

  onMount(() => {
    generateNewAnswer();
  });
</script>

<svelte:head>
  <title>9x9 대각선 스도쿠 정답 생성기</title>
  <meta name="description" content="무작위 9x9 대각선 스도쿠 정답을 생성합니다." />
  <!-- 모바일화면 확대 금지 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
  <div class="max-w-4xl mx-auto">
    <!-- 헤더 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">9x9 대각선 스도쿠 정답 생성기</h1>
      <p class="text-gray-600">완전히 채워진 무작위 9x9 대각선 스도쿠 정답을 생성합니다</p>
    </div>

    <!-- 통계 정보 -->
    <div class="bg-white rounded-lg p-4 shadow-md mb-6">
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600">
          생성 횟수: <span class="font-semibold text-blue-600">{generationCount}회</span>
        </div>
        <div class="text-sm text-gray-600">
          상태: {isGenerating ? '생성 중...' : '완료'}
        </div>
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- 스도쿠 보드 -->
      <div class="bg-white rounded-lg p-6 shadow-lg">
        <h2 class="text-xl font-bold mb-4 text-center">생성된 정답</h2>

        {#if board.length > 0}
          <div class="flex justify-center mb-6">
            <div class="grid grid-cols-9 border-2 border-gray-900 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
              {#each board as row, rowIndex}
                {#each row as cell, colIndex}
                  <div class={getCellClass(rowIndex, colIndex)}>
                    {cell}
                  </div>
                {/each}
              {/each}
            </div>
          </div>
        {:else}
          <div class="flex justify-center items-center h-[360px]">
            <div class="text-center">
              <div class="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p class="text-gray-600">정답을 생성하고 있습니다...</p>
            </div>
          </div>
        {/if}

        <!-- 컨트롤 버튼 -->
        <div class="flex gap-2 justify-center">
          <button
            class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
            disabled={isGenerating}
            on:click={generateNewAnswer}
          >
            <Shuffle class="w-4 h-4" />
            새 정답 생성
          </button>
        </div>
      </div>

      <!-- 정보 및 내보내기 -->
      <div class="space-y-6">
        <!-- 텍스트 형태 -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-bold mb-4">텍스트 형태</h2>

          {#if board.length > 0}
            <div class="bg-gray-50 p-4 rounded-lg mb-4 font-mono text-sm">
              {#each board as row}
                <div>{row.join(' ')}</div>
              {/each}
            </div>

            <div class="flex gap-2">
              <button
                class="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                on:click={copyToClipboard}
              >
                <Copy class="w-4 h-4" />
                복사
              </button>

              <button
                class="flex items-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                on:click={downloadAsFile}
              >
                <Download class="w-4 h-4" />
                다운로드
              </button>
            </div>
          {:else}
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-gray-500 text-center">정답 생성 중...</p>
            </div>
          {/if}
        </div>

        <!-- 생성 정보 -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-bold mb-4">생성 방식</h2>
          <ul class="text-sm text-gray-600 space-y-2">
            <li>• <strong>완전 무작위 생성</strong>: 빈 보드에서 시작하여 백트래킹으로 해결</li>
            <li>• <strong>숫자 순서 무작위화</strong>: 각 셀에 시도할 숫자 순서를 랜덤으로 섞음</li>
            <li>• <strong>대각선 제약 조건</strong>: 두 대각선에도 1~9 숫자가 고유하게 배치</li>
            <li>• <strong>엄격한 검증</strong>: 생성 후 대각선 유효성을 다시 한번 검증</li>
            <li>• <strong>완전한 정답</strong>: 모든 칸이 채워진 유효한 대각선 스도쿠</li>
          </ul>
        </div>

        <!-- 스도쿠 규칙 -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-bold mb-4">9x9 대각선 스도쿠 규칙</h2>
          <ul class="text-sm text-gray-600 space-y-2">
            <li>• 각 행에 1~9 숫자가 하나씩만 포함</li>
            <li>• 각 열에 1~9 숫자가 하나씩만 포함</li>
            <li>• 각 3×3 박스에 1~9 숫자가 하나씩만 포함</li>
            <li>• <span class="text-blue-600 font-semibold">메인 대각선</span>에 1~9 숫자가 하나씩만 포함</li>
            <li>• <span class="text-green-600 font-semibold">반대 대각선</span>에 1~9 숫자가 하나씩만 포함</li>
            <li>• 총 81개 셀, 9개 박스, 2개 대각선으로 구성</li>
          </ul>
          
          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-semibold mb-2">시각적 표시:</h3>
            <div class="text-xs text-gray-600 space-y-1">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-100 border border-gray-300 rounded"></div>
                <span>메인 대각선 (왼쪽 위 → 오른쪽 아래)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-100 border border-gray-300 rounded"></div>
                <span>반대 대각선 (오른쪽 위 → 왼쪽 아래)</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-purple-100 border border-gray-300 rounded"></div>
                <span>대각선 교차점 (중앙)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>