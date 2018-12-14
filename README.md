# Instalation

#### 1. Download and install [node.js](https://nodejs.org/en/download/) 

#### 2. Download and extract [this package](https://github.com/wojciech-panek/ff-auto-register/archive/master.zip) 

#### 3. Open terminal (Mac) or cmd (Windows)

#### 4. Navigate to extracted package

 e.g.

 ```shell
  $ cd C:/Downloads/path/to/package
  ```
#### 5. Install dependencies

 ```shell
  $ npm install
  ```

# Usage

 ```shell
  $ npm start -- --user="email@domain.com" --password="password" --club="24" --day="14" --hour="17:00" --classes="Trengin Funkcjonalny" --capture-errors
  ```
  
## Params

#### 1. `user`: your FF account username

#### 2. `password`

#### 3. `club`: id of FF club (for the time being 24 stands for `FF Bałtyk`)

#### 4. `day`: day of month of classes to book

#### 5. `hour`: hour of classes to book

#### 6. `classes`: name (can be part of the name) of the classes to distinguish classess starting at the same hour

#### 7. `capture-errors`: if passed, program will save screenshots of failed attempts

