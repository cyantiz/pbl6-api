import { category, post, user, visit } from '@prisma/client';
const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const seedCategories: Partial<category>[] = [
  {
    name: 'Football',
    thumbnail:
      'https://img.olympics.com/images/image/private/t_social_share_thumb/f_auto/primary/qjxgsf7pqdmyqzsptxju',
    slug: 'football',
  },
  {
    name: 'Basketball',
    thumbnail:
      'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Mnx8fGVufDB8fHx8fA%3D%3D',
    slug: 'basketball',
  },
  {
    name: 'Car Sport',
    thumbnail:
      'https://static.automotor.vn/images/upload/2021/06/16/lambo.jpeg',
    slug: 'car-sport',
  },
  {
    name: 'Table Tennis',
    thumbnail:
      'https://static.toiimg.com/thumb/resizemode-4,width-1200,height-900,msid-100824676/100824676.jpg',
    slug: 'table-tennis',
  },
  {
    name: 'Tennis',
    thumbnail:
      'https://cdn.britannica.com/57/183257-050-0BA11B4B/Roger-Federer-2012.jpg',
    slug: 'tennis',
  },
  {
    name: 'Swimming',
    thumbnail:
      'https://cdn.britannica.com/01/193601-050-F8F18A9B/Katie-Ledecky-American-lead-way-women-world-2016.jpg',
    slug: 'swimming',
  },
  {
    name: 'Cycling',
    thumbnail:
      'https://s3.amazonaws.com/usac-craft-uploads-production/assets/Road-Header.jpg',
    slug: 'cycling',
  },
];

const defaultHashedPassword =
  '$argon2id$v=19$m=65536,t=3,p=4$xMDOC2bczA7juS7hW682Cw$48Wij7VciKxHrdITuuYPAFQtlDVIm72mjGtdYAcATZw'; //await argon.hash('Default-Password123');
export const seedUsers: Partial<user>[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    email: `nguyen.vh.nhan+${i + 1}@gmail.com`,
    username: `seeduser${i + 1}`,
    name: `Seed User ${i}`,
    role: 'USER',
    avatarUrl:
      'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
    password: defaultHashedPassword,
    isVerified: true,
    verifiedAt: new Date(),
  }),
);
export const seedModerators: Partial<user>[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    email: `nguyen.vh.nhan+${i + 1001}@gmail.com`,
    username: `seedmoderator${i + 1}`,
    name: `Seed Moderator ${i}`,
    role: 'MODERATOR',
    avatarUrl:
      'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
    password: defaultHashedPassword,
    isVerified: true,
    verifiedAt: new Date(),
  }),
);
export const seedAdmins: Partial<user>[] = Array.from({ length: 10 }).map(
  (_, i) => ({
    email: `nguyen.vh.nhan+${i + 2001}@gmail.com`,
    username: `seedadmin${i + 1}`,
    name: `Seed Admin ${i}`,
    role: 'ADMIN',
    avatarUrl:
      'https://images.unsplash.com/photo-1506543730435-e2c1d4553a84?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnQlMjBtaW5pbWFsfGVufDB8fDB8fHww',
    password: defaultHashedPassword,
    isVerified: true,
    verifiedAt: new Date(),
  }),
);

export const seedPosts: Partial<post>[] = Array.from({ length: 200 }).map(
  (_, i) => ({
    title: `Seed Post ${i}`,
    body: `
      <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse fringilla, tellus non tempus ullamcorper, metus erat dignissim purus, a interdum enim nulla vel lacus. Sed nec malesuada massa. Etiam quis tempor neque. Curabitur accumsan enim lacus, id semper nunc viverra id. Donec non dolor semper turpis dignissim interdum. Quisque tincidunt nisi sed urna dictum gravida. Aenean tempus mi sapien, ac accumsan nulla pulvinar eget. Nullam pharetra nibh sapien, ac iaculis risus consectetur rutrum. Fusce scelerisque, massa vitae convallis faucibus, augue sapien gravida velit, semper convallis mauris ante ac eros. Pellentesque semper venenatis orci, non egestas ante faucibus sed. Cras cursus commodo tortor sed tempor. Donec feugiat eleifend ultricies. Phasellus dictum commodo ante aliquet semper. Quisque lobortis, eros ut sagittis cursus, ante arcu feugiat lorem, eu lobortis neque ex quis magna. 
      </p>

      <p>
      Suspendisse gravida est sed felis molestie dapibus. Mauris dapibus aliquet lectus, a suscipit est commodo et. Cras sed fermentum nibh, quis aliquam urna. Cras augue enim, efficitur eu purus vel, consequat pulvinar lorem. Aenean at sodales enim, vel suscipit diam. Sed egestas vestibulum pretium. Etiam sagittis nisi turpis, ac vehicula lorem porttitor quis. Pellentesque sollicitudin quam ante, sed sodales eros maximus ultrices. Suspendisse posuere felis a augue tincidunt, non lobortis odio pretium. Morbi maximus imperdiet fringilla. Suspendisse laoreet turpis vel bibendum ornare. Fusce facilisis tempus accumsan. Donec a lacus ipsum. Fusce in quam tellus. Nulla id purus sed elit lobortis aliquam et a dui. Maecenas eget porta ligula. 
      </p>

      <p>
      Cras rutrum finibus erat, et tincidunt eros gravida nec. Sed varius lorem egestas turpis malesuada sollicitudin. Ut hendrerit arcu leo, ac ultricies lacus aliquam ac. Curabitur egestas porttitor dictum. Duis dapibus tempus leo. Maecenas tempus gravida orci, a facilisis ipsum pulvinar id. Nunc accumsan ipsum purus, ac finibus ante gravida quis. Suspendisse aliquam semper metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
      </p>

      <p>
      Donec ut massa at nisi rhoncus porta. Aliquam malesuada massa ac lorem vulputate pretium. Vestibulum nec velit tellus. Pellentesque ultrices vitae dui id vehicula. Suspendisse gravida porttitor hendrerit. Integer ligula quam, tristique a efficitur vel, congue non libero. Aliquam maximus eros in fermentum bibendum. Duis vitae felis lorem. Fusce id enim nec lacus gravida vestibulum fringilla ut dolor. Curabitur sit amet egestas mi, nec dictum ipsum. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent non urna quis lorem congue molestie ac quis velit. Aenean cursus felis sed tellus molestie, id ullamcorper nulla tincidunt. 
      </p>

      <p>
      Sed blandit, ante posuere maximus cursus, lectus mi porta justo, non dignissim risus purus sit amet nibh. Etiam eget turpis lacinia, commodo nibh condimentum, fringilla augue. Maecenas ultrices leo eu lorem pulvinar, vitae lobortis lorem posuere. Sed et vestibulum nunc, id sodales nunc. Proin pretium metus id ullamcorper porta. Etiam suscipit libero sed faucibus sollicitudin. Donec efficitur odio sed ligula placerat pulvinar ac ut dolor. Nam fermentum, mi in fermentum convallis, velit eros finibus est, nec condimentum arcu nisi eu diam. Aliquam elementum porttitor est vitae aliquam. Etiam quis sagittis sem, nec elementum purus. Sed volutpat, felis eget consequat mattis, arcu nulla malesuada risus, ut finibus metus est eu sem. Aliquam interdum, massa ac pellentesque cursus, tortor sem bibendum est, sed facilisis eros risus eget ligula. Curabitur eget consequat magna, eu iaculis ipsum. 
      </p>
    
    `,
    secondaryText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse fringilla, tellus non tempus ullamcorper, metus erat dignissim purus, a interdum enim nulla vel lacus. Sed nec malesuada massa. Etiam quis tempor neque. Curabitur accumsan enim lacus, id semper nunc viverra id. Donec non dolor semper turpis dignissim interdum. Quisque tincidunt nisi sed urna dictum gravida. Aenean tempus mi sapien, ac accumsan nulla pulvinar eget. Nullam pharetra nibh sapien, ac iaculis risus consectetur rutrum. Fusce scelerisque, massa vitae convallis faucibus, augue sapien gravida velit, semper convallis mauris ante ac eros. Pellentesque semper venenatis orci, non egestas ante faucibus sed. Cras cursus commodo tortor sed tempor. Donec feugiat eleifend ultricies. Phasellus dictum commodo ante aliquet semper. Quisque lobortis, eros ut sagittis cursus, ante arcu feugiat lorem, eu lobortis neque ex quis magna.',
    userId: getRandomInt(1, 10),
    status: 'PUBLISHED',
    createdAt: new Date(),
    categoryId: getRandomInt(1, 7),
  }),
);

export const seedVisits: Partial<visit>[] = Array.from({ length: 5000 }).map(
  () => ({
    userId: getRandomInt(1, 10),
    postId: getRandomInt(1, 100),
    percentage: getRandomInt(0, 100),
    IP: `${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${
      (getRandomInt(0, 255), getRandomInt(0, 255))
    }`,
  }),
);
