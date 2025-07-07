'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
  menu: document.querySelector('.menu__list'), // ← исправил селектор: нужен класс!
  header: {
    h1: document.querySelector('.h1'),
    progressPercent: document.querySelector('.progress__percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar')
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day')
  }
};



/* utils */
// function loadData() {
//   const habbitsString = localStorage.getItem(HABBIT_KEY);
//   const habbitArray = JSON.parse(habbitsString);
//   if (Array.isArray(habbitArray)) {
//     habbits = habbitArray;
//   }
// }


function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray) && habbitArray.length > 0) {
    habbits = habbitArray;
  } else {
    // Если в localStorage пусто — подставляем дефолтные
    habbits = [
      {
        id: 1,
        icon: "sport",
        name: "Отжимания",
        target: 10,
        days: [
          { comment: "Второй день уже проще" },
          { comment: "Первый подход всегда даётся тяжело" }
        ]
      },
      {
        id: 2,
        icon: "food",
        name: "Правильное питание",
        target: 10,
        days: [
          { comment: "Круто!" }
        ]
      }
    ];
  }
}
function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

/* render */
function rerenderMenu(activeHabbit) {
 
  
  page.menu.innerHTML = '';
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
    if (!existed) {
      const element = document.createElement('button');
      element.setAttribute('menu-habbit-id', habbit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => rerender(habbit.id))
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;

      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item_active');
      }

      page.menu.appendChild(element);
      continue;
    }

    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
}
function rerenderHead(activeHabbit) {
  
  page.header.h1.innerText = activeHabbit.name;
  const progress = activeHabbit.days.length / activeHabbit.target > 1
    ? 100
    : activeHabbit.days.length / activeHabbit.target * 100;
  page.header.progressPercent.innerText = progress.toFixed(0) + '%';
  page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
  
} 
function rerenderContent(activeHabbit) {
  // Очищаем контейнер с днями
  page.content.daysContainer.innerHTML = '';

  // Проходим по всем дням привычки
  for (let index = 0; index < activeHabbit.days.length; index++) {
    const day = activeHabbit.days[index];
    const element = document.createElement('div');
    element.classList.add('habbit');
    element.innerHTML = `
      <div class="habbit__day">День ${Number(index) + 1}</div>
      <div class="habbit__comment">${day.comment}</div>
      <button class="habbit__delete" onclick="deleteDay(${index})">
        <img src="./images/delete.svg" alt="Удалить день ${index + 1}" />
      </button>
    `;
    page.content.daysContainer.appendChild(element);
  }
  page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`
} 



function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId
  const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);

}

/* work with days */
function addDays(event) {
  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);
  const comment = data.get('comment');

  form['comment'].classList.remove('error');

  if (!comment) {
    form['comment'].classList.add('error');
    return; // Остановить если пусто
  }

  // Добавляем день к активной привычке
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment }])
      };
    }
    return habbit;
  });

  form['comment'].value = ''; // Очищаем поле
  saveData();
  rerender(globalActiveHabbitId);
}
function deleteDay(index) {
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      const updatedDays = [...habbit.days]; // делаем копию
      updatedDays.splice(index, 1);         // удаляем день
      return {
        ...habbit,
        days: updatedDays
      };
    }
    return habbit; // если не совпал ID — возвращаем без изменений
  });

  saveData();
  rerender(globalActiveHabbitId);
}

 
(() => {
  loadData();
    rerender(habbits[0].id);
  
})();
