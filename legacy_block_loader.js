window.blockLoader = {
  init() {
    if (typeof upgrade_base_url > 'u')
      throw new Error(
        'Базовый URL не установлен. В блоке head необходимо задать переменную window.upgrade_base_url = `основной.url.сайта/`',
      );
    if (typeof upgrade_slug > 'u')
      throw new Error(
        'Псевдоним мероприятия не установлен. В блоке head необходимо задать переменную window.upgrade_slug = `псевдоним_мероприятия`',
      );
    (this.speakers(), this.program(), this.logo(), this.segmentsMap());
  },
  speakers() {
    let r = document.querySelectorAll('.speakers');
    (r.forEach((e) => {
      e.innerHTML = this.showLoader();
    }),
      this.execute(() => {
        r.forEach((e) => {
          let o = {
            role: 'speaker',
            first_page: '0',
            base_color: window.upgrade_base_color ?? '000000',
            second_color: window.upgrade_second_color ?? '000000',
          };
          (Object.assign(o, e.dataset),
            fetch(
              `${upgrade_base_url}program/${upgrade_slug}/speakers?${new URLSearchParams(o)}`,
            ).then((t) =>
              t.text().then((s) => {
                e.innerHTML = s;
                let a = e.querySelector('.carousel')
                  ? e.querySelector('.carousel').id
                  : null;
                (a && new bootstrap.Carousel(`#${a}`),
                  [...document.querySelectorAll('.biography')].map(
                    (n) =>
                      new bootstrap.Popover(n, {
                        html: !0,
                        trigger: 'hover',
                        placement: 'auto',
                      }),
                  ));
              }),
            ));
        });
      }));
  },
  program() {
    let r = document.querySelectorAll('.program');
    (r.forEach((e) => {
      e.innerHTML = this.showLoader();
    }),
      this.execute(() => {
        r.forEach((e) => {
          let o = {
            sidebar_bg: window.upgrade_program_sidebar_bg ?? 'EFEFEF',
            colors: window.upgrade_program_colors_bg ?? '000000,999999',
          };
          (Object.assign(o, e.dataset),
            fetch(
              `${upgrade_base_url}program/${upgrade_slug}?${new URLSearchParams(o)}`,
            ).then((t) =>
              t.text().then((s) => {
                ((e.innerHTML = s),
                  document.querySelectorAll('.link-scroll-to').forEach((l) => {
                    l.addEventListener('click', (n) => {
                      let i = document.querySelector(
                        n.target.getAttribute('href'),
                      );
                      this.highlight(i);
                    });
                  }),
                  [...document.querySelectorAll('.biography')].map(
                    (l) =>
                      new bootstrap.Popover(l, {
                        html: !0,
                        trigger: 'hover',
                        placement: 'auto',
                      }),
                  ),
                  setTimeout(() => {
                    const l = document.querySelector(window.location.hash);
                    (l.scrollIntoView(), this.highlight(l));
                  }, 100));
              }),
            ));
        });
      }));
  },
  logo() {
    let r = document.querySelectorAll('.logos');
    (r.forEach((e) => {
      e.innerHTML = this.showLoader();
    }),
      this.execute(async () => {
        let e = {},
          o = [];
        await fetch(`${upgrade_base_url}logotypes_data/${upgrade_slug}`, {
          cache: 'no-store',
        })
          .then((t) => t.json())
          .then((t) => {
            e = t;
          });
        for (const t of r) {
          let s = t.dataset.block ?? '0';
          !t.dataset.slug || t.dataset.slug === upgrade_slug
            ? (t.innerHTML = e[s] ?? '')
            : (o[t.dataset.slug] ||
                (await fetch(
                  `${upgrade_base_url}logotypes_data/${t.dataset.slug}`,
                  { cache: 'no-store' },
                )
                  .then((a) => a.json())
                  .then((a) => {
                    o[t.dataset.slug] = a;
                  })),
              (t.innerHTML = o[t.dataset.slug][s] ?? ''));
        }
      }));
  },
  segmentsMap() {
    let r = document.querySelector('#segments-map');
    r &&
      ((r.innerHTML = this.showLoader()),
      this.execute(() => {
        fetch(`${upgrade_base_url}map-services`).then((e) =>
          e.text().then((o) => {
            ((r.innerHTML = o),
              [
                ...document.querySelectorAll(
                  '[data-bs-toggle="popover-brand"]',
                ),
              ].map((s) => new bootstrap.Popover(s)));
          }),
        );
      }));
  },
  showLoader() {
    return `<div class="d-flex justify-content-center my-5">
                    <div class="spinner-border text-secondary" role="status" style="text-align: center">
                        <span class="visually-hidden">Загрузка...</span>
                    </div>
                </div>`;
  },
  execute(r) {
    let e = setInterval(() => {
      typeof bootstrap == 'object' && (r(), clearInterval(e));
    }, 100);
  },
  highlight(r) {
    (r.classList.add('program-block-hilite'),
      setTimeout(() => r.classList.remove('program-block-hilite'), 2e3));
  },
};
