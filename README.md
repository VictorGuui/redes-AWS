# Criação de Infraestrutura de Rede

  ### Topologia da Rede
![image](https://github.com/user-attachments/assets/330e6fd8-26c1-4fde-ae76-c8d3a6dc045f)


  ### Pré-requisitos
* Duas instâncias EC2 onde o frontend está hospedado.
* Uma instância EC2 para o Load Balancer.
* Uma instância EC2 para o Proxy Reverso e VPN.
* Uma instância EC2 para o Backend e Banco de Dados.


*******

## Configuração do Load Balancer
1. **Instalação do NGINX**
    * Acesse a máquina (Load Balancer).
    * Execute o comando:
      
     <br>

     ```
   
     sudo apt update
     sudo apt install nginx
   
     ```
   

2. **Configuração do NGINX como Load Balancer**
    * Criando um novo arquivo de configuração:

     <br>

     ```

     sudo nano /etc/nginx/conf.d/loadBalancer.conf

     ```

    * Adicione a seguinte configuração:
    
     <br>

     ```
     
     upstream servidores{
        server # IP da máquina 1
        server # IP da máquina 2
     }
     
     server {
       listen 80;
       server_name _;

       location / {
         proxy_pass http://servidores;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
       }
     }
     
      ```


 3. **Remoção da Configuração Padrão**
    * Remova o link para a configuração padrão:

     <br>

     ```

     sudo rm /etc/nginx/sites-enabled/default

     ```
     
 4. **Teste e Reinicie o NGINX**
    * Teste a configuração:

     <br>

      ```

      sudo nginx -t

      ```

    * Reinicie o NGINX:
   
     <br>

      ```

      sudo systemctl restart nginx

      ```

  *******
  
 ## Configuração do Proxy Reverso
 1. **Instalação do NGINX**
    * Acesse a máquina (Proxy Reverso).
    * Execute o comando:
      
     <br>

      ```
   
      sudo apt update
      sudo apt install nginx
   
      ```
   

2. **Configuração do NGINX como Proxy Reverso**
    * Criando um novo arquivo de configuração:

     <br>

     ```

     sudo nano /etc/nginx/sites-available/proxy-reverse

     ```

    * Adicione a seguinte configuração, apontando para o Load Balancer:
    
     <br>

     ```
     
     server {
       listen 80;

       location / {
         proxy_pass http://<endereco-IP-da-maquina-loadBalancer>;
         proxy_set_header Host $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
       }
     
     }
     
     ```

    * Habilite a configuração:

     <br>

     ```
     
     sudo ln -s /etc/nginx/sites-available/proxy-reverse /etc/nginx/sites-enabled/
     
     ```

 3. **Remoção da Configuração Padrão**
    * Remova o link para a configuração padrão:

     <br>

     ```

     sudo rm /etc/nginx/sites-enabled/default

     ```
     
 4. **Teste e Reinicie o NGINX**
    * Teste a configuração:

     <br>

      ```

      sudo nginx -t

      ```

    * Reinicie o NGINX:
   
     <br>

      ```

      sudo systemctl restart nginx

      ```

  *******
  
## Configuração da VPN
1. **Instalação do OpenVPN no servidor**
   * Acesse a máquina (Proxy Reverso).
   * Faça o download do script de instalação:

   <br>

   ```

   wget https://git.io/vpn -O openvpn-install.sh

   ```

   * Torne o script executável:

   <br>

   ```

   sudo chmod +x openvpn-install.sh

   ```

   * Execute o script para instalar o OpenVPN:

   <br>

   ```

   sudo bash openvpn-install.sh

   ```

   * Copie o arquivo de configuração do cliente para o diretório do usuário padrão:

   <br>

   ```

   sudo cp /root/client1.ovpn ~

   ```

   * Baixe o arquivo ``.ovpn`` para a máquina local:

   <br>

   ```

   scp -i /caminho/para/chave.pem ubuntu@<IP-SERVIDOR>:/home/ubuntu/client1.ovpn .

   ```

2. **Configuração do Cliente no Windows**
   * Baixe o cliente OpenVPN: [OpenVPN Connect](https://openvpn.net/client/client-connect-vpn-for-windows/);
   * Abra o cliente OpenVPN e selecione o arquivo de configuração ``.ovpn`` para conectar-se ao servidor.

   <br>

3. **Configuração do NGINX para Trabalhar com a VPN**
   * Edite o arquivo de configuração do NGINX:

   <br>

   ```

   sudo nano /etc/nginx/sites-available/default

   ```

   * Adicione a modificação para escutar apenas a interface VPN:
  
   <br>

   ```

   listen 10.8.0.1:80;

   ```

   * Reinicie o NGINX:

   <br>

   ```

   sudo systemctl restart nginx

   ```

   * Para visualizar o arquivo de configuração do servidor OpenVPN, execute:

   <br>

   ```

   sudo nano /etc/openvpn/server/server.conf

   ```

*******

## Configuração do Banco de Dados
1. **Instalação do Docker e Docker Compose**
    * Acesse a máquina (Banco de Dados/Docker).
    * Execute o comando:

    <br>

    ```

    sudo apt update
    sudo apt install -y docker.io docker-compose

    ```

2. **Configurar o Docker Compose**
    * Crie o arquivo ``docker-compose.yml`` na raiz do projeto:
    
    <br>

    ```

    sudo nano /projeto-redes/backend/docker-compose.yml
    
    ```

    * Adicione a seguinte configuração para preparar o banco de dados MySQL:

    <br>

    ```

    version: '3.8'

    services:
      main-db:
        image: mysql:8.0
        restart: always
        container_name: main-db
        environment:
          MYSQL_DATABASE: crud
          MYSQL_ROOT_PASSWORD: 12345678
        ports:
          - '3307:3306'
        volumes: 
          - ./data/db:/var/lib/mysql


    ```

3. **Rodar o Projeto**
    * O backend utiliza o módulo ``child-process`` para  executar comandos externos, como o ``docker-compose up``, que permite subir os containers. 
    * Executar o backend:

    <br>

    ```

    npm start

    ```
    
    * Ordem de inicialização:
      1. Docker Compose é iniciado: o comando ``docker-compose up -d`` inicializa o container MySQL.
      2. O Sequelize sincroniza com o banco de dados no container.
      3. O servidor Express é iniciado na porta 3000.


4. **Acessar Banco de Dados diretamente pelo container**
   * Verifique se o container está rodando:

    <br>

    ```

    sudo docker ps

    ```

    * Conecte-se ao container Docker:

    <br>

    ```

    docker exec -it <container_id> mysql -u root -p

    ```

    * Para visualizar os usuários cadastrados, execute dentro do shell do MySQL:

    <br>

    ```
    USE crud;
    SELECT * FROM User;

    ```
