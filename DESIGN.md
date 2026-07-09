# 삼운몽: 세 개의 꿈 - Page and Mechanism Rationale

## 1. Service overview

- **Problem to solve:** 플레이어가 꿈속에서 여러 사건을 조사하며 단서와 진술을 연결해 범인을 찾는 미스터리 추리 경험을 만든다.
- **Target users:** 추리 게임, 포인트 앤 클릭 조사, 대화형 심문, 어두운 미스터리 분위기를 선호하는 플레이어.
- **Core experience:** 메인 화면에서 게임의 미스터리한 분위기를 접한 뒤, 튜토리얼을 통해 꿈 세계관을 이해하고, 세 개의 꿈/사건 중 하나를 선택해 사건 현장과 취조실을 오가며 증거를 수집하고 용의자를 심문한다. 마지막에는 범인을 지목하고 결과와 에필로그를 본다.
- **My design priority:** 전체 게임은 특정 시대물로 고정하지 않고, 어둡고 몽환적인 미스터리 추리 게임 톤을 유지한다. 조선시대 분위기는 현재 제작 중인 첫 번째 테마에 한정한다.
- **Source materials reviewed:** 메인 타이틀 화면, 조선 골목 시신 현장, 한옥 내부 방, 증거 카드 모음, 달밤 한옥 마당, 마법학교/불탄 서재 후보, 우주 정거장 후보, 조선 마을 지도, 제작된 조선시대 장면 이미지, 용의자 기본/소매 확인 이미지, 증거품목 이미지.

## 2. User flow

1. **메인 화면**
   - 게임 시작 시 가장 먼저 보이는 화면이다.
   - `NEW DREAM`, `CONTINUE`, `SETTINGS`, `EXIT` 같은 메뉴를 통해 시작, 이어하기, 설정, 종료 흐름을 제공한다.

2. **튜토리얼**
   - 꿈 세계관을 설명한다.
   - 플레이어는 꿈에서 깨기 위해 세 개의 사건을 해결해야 한다는 목표를 이해한다.
   - `SKIP` 버튼으로 튜토리얼을 건너뛸 수 있어야 한다.

3. **꿈 선택 화면**
   - 플레이어에게 어떤 꿈을 먼저 꿀지 선택하게 한다.
   - 세 개의 테마 중 하나를 선택하는 구조이다.
   - 현재는 조선시대 테마를 우선 제작한다. 마법학교와 우주 정거장 테마는 확장 후보이다.

4. **꿈 진입 및 역할 인지**
   - 선택한 꿈의 배경 설명이 나온다.
   - 조선시대 테마에서는 다른 캐릭터가 플레이어를 `사또님`처럼 부르며, 플레이어가 꿈 안에서 사또 역할임을 자연스럽게 인지한다.

5. **사건 현장 조사**
   - 플레이어는 현장 화면에서 증거를 클릭해 수집한다.
   - 혈흔, 문서, 장신구, 발자국, 상자, 호패 관련 물건처럼 시각적으로 눈에 띄는 단서가 중심이 된다.

6. **취조실 심문**
   - 플레이어는 취조실에서 4명의 용의자를 심문한다.
   - 용의자에게 질문하고, 증거와 진술의 모순을 찾는다.
   - 특정 질문을 하면 소매 확인 같은 장면 전환이 일어날 수 있다.

7. **범인 지목**
   - 수집한 증거와 심문 결과를 바탕으로 범인을 지목한다.
   - 제한시간은 없다.
   - 실패로 막히는 구조가 아니라, 모든 플레이어가 결국 진상에 도달하도록 설계한다.

8. **결과와 에필로그**
   - 범인 지목 결과가 나온다.
   - 사건 해결 후 꿈에서 깨는 에필로그 또는 아직 다른 사건이 남았다는 에필로그로 이어질 수 있다.

## 3. Pages

### 메인 화면

- **Role in the flow:** 게임의 첫인상과 전체 미스터리 톤을 전달하는 시작 화면.
- **User action:** 새 게임 시작, 이어하기, 설정, 종료를 선택한다.
- **Included elements:** 큰 제목, 어두운 달밤 배경, 범죄 현장 요소, 꿈처럼 섞인 이질적인 공간감, 영문 메뉴 버튼.
- **Purpose:** 플레이어가 이 게임을 특정 시대물이 아니라 꿈속 여러 사건을 해결하는 미스터리 추리 게임으로 받아들이게 한다.
- **Why I chose this design:** 메인 화면은 조선시대 테마만 대표하지 않는다. 한옥, 범죄 현장, 우주 공간 같은 요소가 함께 보이므로 전체 게임이 여러 꿈/사건으로 확장될 수 있다는 인상을 준다.
- **Connected pages or mechanisms:** 튜토리얼, 꿈 선택 화면.
- **Decision status:** Confirmed.

### 튜토리얼 화면

- **Role in the flow:** 꿈 세계관과 기본 목표를 설명하는 도입 화면.
- **User action:** 설명을 읽거나 `SKIP` 버튼으로 건너뛴다.
- **Included elements:** 꿈에서 깨기 위해 세 개의 사건을 해결해야 한다는 설명, 건너뛰기 버튼.
- **Purpose:** 플레이어가 왜 사건을 해결해야 하는지 이해하게 한다.
- **Why I chose this design:** 세계관 설명이 없으면 꿈 선택과 사건 해결 목표가 분리되어 보일 수 있으므로, 짧은 튜토리얼로 목표를 먼저 고정한다.
- **Connected pages or mechanisms:** 메인 화면, 꿈 선택 화면.
- **Decision status:** Confirmed.

### 꿈 선택 화면

- **Role in the flow:** 세 개의 사건/테마 중 플레이할 꿈을 고르는 허브.
- **User action:** 먼저 플레이할 꿈을 선택한다.
- **Included elements:** 세 개의 테마 선택지, 현재 제작 중인 조선시대 테마, 이후 확장 후보인 마법학교와 우주 정거장 테마.
- **Purpose:** 게임이 여러 사건으로 구성된다는 구조를 명확히 보여준다.
- **Why I chose this design:** 사용자가 처음부터 여러 꿈이 존재한다는 구조를 이해하면, 한 사건을 끝낸 뒤에도 다음 사건이 남아 있다는 에필로그가 자연스럽게 연결된다.
- **Connected pages or mechanisms:** 튜토리얼, 꿈 진입 및 역할 인지, 에필로그.
- **Decision status:** Confirmed for structure / Unresolved for exact names and order of all three themes.

### 조선시대 배경 설명 화면

- **Role in the flow:** 조선시대 테마에 진입했음을 알려주는 브리핑 화면.
- **User action:** 사건 배경을 읽고 다음 장면으로 이동한다.
- **Included elements:** 조선 한옥 마을, 저택, 시신 발견, 수사 시작을 암시하는 설명.
- **Purpose:** 현재 선택한 꿈이 조선시대 테마이며, 플레이어가 이 꿈 안에서 수사 역할을 맡는다는 맥락을 제공한다.
- **Why I chose this design:** 전체 게임은 조선풍으로 고정되지 않지만, 조선시대 테마 안에서는 시대 분위기와 사건 현장 몰입이 필요하다.
- **Connected pages or mechanisms:** 꿈 선택 화면, 사또 역할 인지 장면, 사건 현장.
- **Decision status:** Tentative. 정확한 피해자, 사건 시간, 사건 장소는 추후 확정 필요.

### 사또 역할 인지 장면

- **Role in the flow:** 플레이어가 꿈 안에서 맡은 역할을 자연스럽게 깨닫는 장면.
- **User action:** 다른 인물의 대사를 통해 자신이 사또 역할임을 인지한다.
- **Included elements:** `사또님` 같은 호칭, 보고를 올리는 인물, 사건을 처리해야 하는 상황.
- **Purpose:** 플레이어에게 별도 설명문으로 역할을 주입하지 않고, 대사와 상황으로 역할을 이해하게 한다.
- **Why I chose this design:** 꿈이라는 설정에서는 낯선 역할에 갑자기 놓이는 감각이 중요하다. 주변 인물이 플레이어를 특정 역할로 대하면 몰입감이 높아진다.
- **Connected pages or mechanisms:** 조선시대 배경 설명 화면, 사건 현장, 취조실.
- **Decision status:** Confirmed for direction / Unresolved for exact dialogue.

### 조선 사건 현장

- **Role in the flow:** 플레이어가 단서를 직접 찾는 조사 화면.
- **User action:** 화면 속 단서를 클릭해 증거를 수집한다.
- **Included elements:** 어두운 한옥 골목, 젖은 돌길, 쓰러진 인물, 편지, 장신구, 발자국, 혈흔, 등불, 증거 보따리, 대화 기록장 버튼.
- **Purpose:** 사건의 시작점을 보여주고, 플레이어가 직접 수사에 참여한다고 느끼게 한다.
- **Why I chose this design:** 어두운 현장과 작은 단서는 포인트 앤 클릭 추리 게임의 기본 행동을 자연스럽게 유도한다.
- **Connected pages or mechanisms:** 증거 인벤토리, 취조실, 모순 기록.
- **Decision status:** Confirmed for visual direction. 현장에서도 취조실과 같은 대화 기록장을 열어볼 수 있다.

### 조선 마을 지도 화면

- **Role in the flow:** 조선시대 테마 안의 조사 장소를 선택하는 화면.
- **User action:** 붉은 인장으로 표시된 장소를 선택한다.
- **Included elements:** 낡은 종이 지도, 여러 장소의 붉은 인장, 촛불, 붓, 피 묻은 물건.
- **Purpose:** 플레이어가 사건 현장, 인물의 방, 취조실 등 장소를 오갈 수 있게 한다.
- **Why I chose this design:** 지도는 조선시대 테마의 물성을 살리면서도 장소 이동 구조를 한눈에 보여준다.
- **Connected pages or mechanisms:** 사건 현장, 인물별 조사 장소, 취조실.
- **Decision status:** Confirmed for direction / Unresolved for final location list.

### 인물별 조사 장소

- **Role in the flow:** 용의자와 관련된 생활 공간을 조사하는 화면.
- **User action:** 방 안의 문서, 보관함, 침구, 생활 도구, 숨겨진 물건을 클릭해 단서를 찾는다.
- **Included elements:** 춘월의 방, 돌쇠의 거처, 무덕의 하인방, 유문석 사랑방 같은 장소.
- **Purpose:** 각 인물의 관계, 숨기는 정보, 동기를 추론할 수 있는 환경 단서를 제공한다.
- **Why I chose this design:** 취조실 대화만으로는 추리가 단조로워질 수 있으므로, 인물의 공간에서 성격과 비밀을 간접적으로 보여준다.
- **Connected pages or mechanisms:** 지도 화면, 증거 인벤토리, 취조실.
- **Decision status:** Tentative. 각 장소의 최종 단서 구성은 추후 확정 필요.

### 취조실

- **Role in the flow:** 용의자와 대화하고 진술을 확보하는 화면.
- **User action:** 용의자를 선택하고 질문한다. 필요한 경우 증거를 제시한다.
- **Included elements:** 어두운 취조실 배경, 용의자 중심 배치, 질문 입력/추천 질문, 등장인물별 카카오톡식 대화 기록장, 증거 제시 영역.
- **Purpose:** 현장 조사에서 얻은 증거를 진술과 대조해 모순을 찾게 한다.
- **Why I chose this design:** 사건 현장과 취조실을 왕복하게 만들면 추리의 리듬이 생긴다. 플레이어는 단서를 얻고, 질문하고, 다시 현장을 확인하는 반복을 하게 된다.
- **Connected pages or mechanisms:** 증거 인벤토리, 모순 기록, 범인 지목.
- **Decision status:** Confirmed for loop. 기록장은 등장인물 4명별로 넘겨 볼 수 있는 질문/답변 대화 기록 용도로 사용하며, 현장에서도 같은 기록장을 볼 수 있다.

### 소매 확인 장면

- **Role in the flow:** 특정 질문에 따라 용의자의 신체 단서를 확인하는 장면.
- **User action:** 용의자에게 소매 확인 질문을 한다.
- **Included elements:** 각 용의자가 소매를 걷는 장면, 팔 주변에 집중되는 화면 구성.
- **Purpose:** 대화 질문이 단순 텍스트 응답을 넘어서 시각적 증거 발견으로 이어지게 한다.
- **Why I chose this design:** 질문 결과가 장면 전환으로 보이면 플레이어가 심문을 적극적으로 시도하게 된다.
- **Connected pages or mechanisms:** 취조실, 증거 인벤토리, 모순 기록.
- **Decision status:** Confirmed for direction. `긁힌 팔 흔적`은 돌쇠의 소매 아래에서만 수집되는 방향.

### 증거 인벤토리

- **Role in the flow:** 플레이어가 수집한 단서를 비교하고 재검토하는 화면.
- **User action:** 증거 카드를 선택하고 상세 정보를 본다.
- **Included elements:** 초상화 조각, 장신구, 상자, 찢어진 문서, 목패.
- **Purpose:** 추리의 핵심 재료를 시각적으로 기억하기 쉽게 만든다.
- **Why I chose this design:** 수집한 단서를 다시 읽고 증언과 비교할 수 있어야 범인 지목이 설득력을 가진다.
- **Connected pages or mechanisms:** 사건 현장, 취조실, 범인 지목.
- **Decision status:** Confirmed for direction.

### 범인 지목 결과 화면

- **Role in the flow:** 최종 범인 지목 이후 플레이어의 판단 결과를 보여준다.
- **User action:** 성공 또는 실패 결과를 확인하고, 이번 꿈을 다시 꾸거나 꿈 선택 화면으로 나간다.
- **Included elements:** 선택한 용의자의 판결패, 최종 지목 화면과 같은 호패형 패널, 붉은 도장, 타자 효과 문장.
- **Purpose:** 플레이어의 지목 결과를 강하게 각인시키고, 다음 꿈으로 이어질 여운을 만든다.
- **Why I chose this design:** 지목 화면과 결과 화면의 패널 디자인을 통일하면 선택과 판결이 같은 의식처럼 느껴진다.
- **Connected pages or mechanisms:** 범인 지목, 취조실, 꿈 선택 화면.
- **Decision status:** User-approved direction. 실제 범인과 최종 진상 문구는 추후 확정 필요.

### 꿈 선택 복귀 안내

- **Role in the flow:** 결과 화면에서 꿈을 나간 뒤, 아직 남은 두 개의 꿈이 있음을 알려준다.
- **User action:** `꿈에서 나가기`를 누르면 안내 팝업을 확인한 뒤 꿈 선택 화면으로 돌아간다. `이번 꿈을 다시 꾸기`는 튜토리얼이 아니라 조선시대 사건 배경 설명 화면으로 바로 돌아간다.
- **Included elements:** 흑백 레트로 시스템 팝업, 경고 아이콘, 잠긴 꿈을 암시하는 문구.
- **Purpose:** 조선시대 꿈이 끝나도 전체 게임의 세 꿈 구조가 이어진다는 사실을 자연스럽게 전달한다.
- **Why I chose this design:** 꿈 선택 화면은 메타적인 허브이므로, 고문서보다 레트로 시스템 경고창 같은 비현실적 UI가 꿈의 층위를 더 잘 보여준다.
- **Result exit copy:** `꿈은 아직 끝나지 않았습니다.` / `테마 선택으로 돌아가시겠습니까?`
- **Locked dream copy:** `아직 꿈을 그리고 있습니다...` / `이 꿈은 아직 완성되지 않았습니다. 봉인이 풀릴 때까지 기다려 주세요.`
- **Decision status:** User-approved direction. 나머지 두 꿈의 실제 테마와 해금 조건은 추후 확정 필요.

### 범인 지목 경고 팝업

- **Role in the flow:** 핵심 단서를 충분히 모으기 전에 최종 지목을 시도하면 한 번 더 확인시킨다.
- **User action:** 그대로 지목하거나, 더 조사하기 위해 지목 화면으로 돌아간다.
- **Included elements:** 낡은 종이 질감, 어두운 목재 버튼, 붉은 인장, 조선시대 판결문 같은 경고 문구.
- **Tone split:** 조선시대 사건 안에서 사또가 판단하는 장면이므로 흑백 레트로 팝업을 쓰지 않고 조선풍 UI를 사용한다. 흑백 레트로 팝업은 꿈 바깥의 시스템/세계관 레이어에서만 사용한다.
- **Font direction:** 팝업 제목, 본문, 버튼은 나눔손글씨 바른정신을 사용해 기존 조선시대 UI와 통일한다.
- **Warning copy:** `아직 맞춰 보지 못한 흔적이 있습니다. 그래도 이 자를 지목하시겠습니까?`
- **Decision status:** User-approved copy and visual direction.
