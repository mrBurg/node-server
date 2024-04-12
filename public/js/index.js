'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const content = $('#content');
  const footer = $('footer');
  const postgreSql = $('#postgre-sql');
  const mySql = $('#my-sql');
  const rss = $('#rss');

  if (postgreSql) {
    postgreSql.addEventListener('click', () =>
      fetch('/db')
        .then(async (data) => {
          const res = await data.json();

          if (content) {
            content.replaceChildren();

            res.forEach((item) => {
              const div = create('div');

              div.innerHTML = `id: ${item.ga_id}, name: ${item.ga_name}, rating: ${item.ga_rating}`;

              content.appendChild(div);
            });
          }
        })
        .catch(console.log)
    );
  }

  if (mySql) {
    mySql.setAttribute('disabled', true);
    mySql.addEventListener('click', () => console.log('my-sql clicked'));
  }

  if (rss) {
    rss.addEventListener('click', async () => {
      const res = await fetch(
        'https://rss.app/feeds/v1.1/NdQShz3u4hCZx0MD.json'
      );

      const { items } = await res.json();

      if (content) {
        content.replaceChildren();

        items.forEach((item) => {
          const div = create('div');

          div.innerHTML = `title: ${item.title}, description: ${item.description}, link: ${item.link}`;

          content.appendChild(div);
        });
      }
    });
  }

  const copyright = create('span');
  const startDate = new Date('2012-05-01T00:00:00');

  copyright.innerHTML = `${startDate.getFullYear()} - ${new Date(
    Date.now()
  ).getFullYear()}`;

  footer.appendChild(copyright);
});
