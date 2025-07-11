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
  },
  popup: {
    index: document.getElementById('add-habbit-popup'),
    iconField: document.querySelector('.popup__form input[name="icon"]')
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
function togglePopup() {
  if (page.popup.index.classList.contains('cover_hidden')) {
    page.popup.index.classList.remove('cover_hidden');
  } else {
    page.popup.index.classList.add('cover_hidden');
  }
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  const res = {}; // Результат проверки

  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
      res[field] = false; // Не прошёл
    } else {
      res[field] = true; // Всё ок
    }
    res[field] = fieldValue
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false
    }
  }
  if (!isValid) {
    return
  }
  return res;
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
  document.location.replace(document.location.pathname + '#' + activeHabbitId)
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);

}

/* work with days */
function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['comment'])
  if (!data) {
    return
  }
  // Добавляем день к активной привычке
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }])
      };
    }
    return habbit;
  });

  resetForm(event.target, ['comment'])
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

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  if (activeIcon) {
    activeIcon.classList.remove('icon_active');
  }
  context.classList.add('icon_active');
}

function addHabbit(event) {
  event.preventDefault()
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ['name', 'icon', 'target'])
  if (!data) {
    return
  }
  const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: []
  })
  resetForm(event.target, ['name', 'target']);
  togglePopup()
  saveData()
  rerender(maxId + 1);
}



(() => {
  loadData();

  const hashId = Number(document.location.hash.replace('#', ''));

 
  const urlHabbit = habbits.find(habbit => habbit.id === hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  } else {
    rerender(habbits[0].id);
  }

})()