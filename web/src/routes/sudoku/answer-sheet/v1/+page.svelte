<script lang="ts">
  import { onMount } from 'svelte';
  import { RotateCcw, Shuffle, Download, Copy } from 'lucide-svelte';

  // 6x6 스도쿠 보드 (완전히 채워진 정답)
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
    for (let c = 0; c < 6; c++) {
      if (c !== col && board[row][c] === num) return false;
    }

    // 같은 열 검사
    for (let r = 0; r < 6; r++) {
      if (r !== row && board[r][col] === num) return false;
    }

    // 2x3 박스 검사
    const boxRow = Math.floor(row / 2) * 2;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 2; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      }
    }

    return true;
  }

  // 빈 셀 찾기
  function findEmptyCell(board: number[][]): { row: number; col: number } | null {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 6; col++) {
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
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6]); // 숫자 순서를 무작위로

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
    const newBoard: number[][] = Array(6).fill(null).map(() => Array(6).fill(0));

    // 무작위로 해결
    if (solveSudokuRandomly(newBoard)) {
      return newBoard;
    }

    // 실패하면 재시도 (거의 발생하지 않음)
    return generateRandomSudoku();
  }

  // 추가 무작위화 (행/열/박스 섞기)
  function applyAdditionalRandomization(board: number[][]): number[][] {
    let result = board.map(row => [...row]);

    // 같은 박스 내에서 행 섞기
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      const rowsInBox = [boxRow * 2, boxRow * 2 + 1];
      const shuffledRows = shuffleArray(rowsInBox);

      const tempRows = shuffledRows.map(r => [...result[r]]);
      shuffledRows.forEach((originalRow, index) => {
        result[rowsInBox[index]] = tempRows[index];
      });
    }

    // 같은 박스 내에서 열 섞기
    for (let boxCol = 0; boxCol < 2; boxCol++) {
      const colsInBox = [boxCol * 3, boxCol * 3 + 1, boxCol * 3 + 2];
      const shuffledCols = shuffleArray(colsInBox);

      for (let row = 0; row < 6; row++) {
        const tempCells = shuffledCols.map(c => result[row][c]);
        colsInBox.forEach((originalCol, index) => {
          result[row][originalCol] = tempCells[index];
        });
      }
    }

    return result;
  }

  // 새로운 정답 생성
  async function generateNewAnswer() {
    if (isGenerating) return;

    isGenerating = true;
    generationCount++;

    try {
      // 기본 무작위 생성
      let newBoard = await generateRandomSudoku();

      // 추가 무작위화 적용
      newBoard = applyAdditionalRandomization(newBoard);

      board = newBoard;
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
    let classes = 'flex items-center justify-center text-2xl font-bold border border-gray-400 ';
    classes += 'w-[60px] h-[60px] '; // 정답표시용으로 크게
    classes += 'bg-white text-gray-800 ';

    // 박스 구분을 위한 굵은 테두리
    if (row % 2 === 0) classes += 'border-t-2 border-t-gray-600 ';
    if (col % 3 === 0) classes += 'border-l-2 border-l-gray-600 ';
    if (row === 5) classes += 'border-b-2 border-b-gray-600 ';
    if (col === 5) classes += 'border-r-2 border-r-gray-600 ';

    return classes;
  }

  onMount(() => {
    generateNewAnswer();
  });
</script>

<svelte:head>
  <title>스도쿠 정답 생성기</title>
  <meta name="description" content="무작위 6x6 스도쿠 정답을 생성합니다." />
  <!-- 모바일화면 확대 금지 -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
  <div class="max-w-4xl mx-auto">
    <!-- 헤더 -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">스도쿠 정답 생성기</h1>
      <p class="text-gray-600">완전히 채워진 무작위 6x6 스도쿠 정답을 생성합니다</p>
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
            <div class="grid grid-cols-6 border-2 border-gray-900 inline-block">
              {#each board as row, rowIndex}
                {#each row as cell, colIndex}
                  <div class={getCellClass(rowIndex, colIndex)} style="w-100 h-100">
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
            <li>• <strong>구조적 무작위화</strong>: 박스 내 행/열 위치를 추가로 섞음</li>
            <li>• <strong>완전한 정답</strong>: 모든 칸이 채워진 유효한 스도쿠</li>
          </ul>
        </div>

        <!-- 스도쿠 규칙 -->
        <div class="bg-white rounded-lg p-6 shadow-lg">
          <h2 class="text-xl font-bold mb-4">6x6 스도쿠 규칙</h2>
          <ul class="text-sm text-gray-600 space-y-2">
            <li>• 각 행에 1~6 숫자가 하나씩만 포함</li>
            <li>• 각 열에 1~6 숫자가 하나씩만 포함</li>
            <li>• 각 2×3 박스에 1~6 숫자가 하나씩만 포함</li>
            <li>• 총 36개 셀, 6개 박스로 구성</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>