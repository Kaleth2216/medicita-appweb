# MediCita - Sistema de Agendamiento de Citas Hospitalarias

Proyecto integrador de Calidad de Software 2026A.

Sistema web para la gestión y agendamiento de citas médicas, con módulos diferenciados para pacientes, médicos y administradores.

---

## Tecnologías utilizadas

| Capa | Tecnología |
|---|---|
| **Backend** | Java 26, Spring Boot 3.5.14, Spring Security, Spring Data JPA, PostgreSQL |
| **Frontend** | HTML5, Bootstrap 5, JavaScript vanilla |
| **Testing** | JUnit 5, Selenium WebDriver, JMeter, SonarQube |
| **Infraestructura** | Docker, Docker Compose, GitHub Actions |

---

## Estructura del repositorio

```
medicita-appweb/
├── app/                        # Aplicación Spring Boot (backend + frontend)
│   ├── src/main/java/          # Código fuente Java
│   ├── src/main/resources/     # Configuración, templates y assets estáticos
│   └── pom.xml                 # Dependencias Maven
├── docker/                     # Archivos Docker
│   ├── Dockerfile              # Build multi-stage de la aplicación
│   ├── docker-compose.yml      # Stack completo (db + app + sonarqube)
│   └── docker-compose.dev.yml  # Solo infraestructura para desarrollo local
├── tests/
│   ├── selenium/               # Pruebas de UI automatizadas
│   └── jmeter/                 # Planes de prueba de carga
├── docs/                       # Documentación del proyecto
├── reports/                    # Reportes de calidad y cobertura
├── .github/workflows/          # Pipelines de CI/CD
├── docker-compose.yml          # Acceso rápido al stack completo desde la raíz
└── README.md
```

---

## Requisitos previos

- Java 21+
- Maven 3.8+
- Docker y Docker Compose
- Git

---

## Instalación y ejecución

### Opción A - Con Docker (recomendado)

```bash
git clone https://github.com/Kaleth2216/medicita-appweb.git
cd medicita-appweb
docker-compose up --build
```

Acceder en: http://localhost:8080

### Opción B - Desarrollo local

```bash
# Levantar solo DB y SonarQube
docker-compose -f docker/docker-compose.dev.yml up -d
# Correr la aplicación
cd app
mvn spring-boot:run
```

---

## Credenciales por defecto

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@medicita.com | Admin2026* |

---

## Módulos del sistema

- **Módulo Paciente**: registro, agendamiento de citas, historial de consultas.
- **Módulo Médico**: gestión de horario semanal, atención de citas, solicitud de permisos.
- **Módulo Admin**: gestión de médicos y especialidades, aprobación de permisos.

---

## Ejecutar pruebas

```bash
cd app
mvn test
mvn jacoco:report
```

---

## Análisis SonarQube

```bash
cd app
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000
```

El dashboard de SonarQube estará disponible en: http://localhost:9000

---

## Integrantes del equipo

- <!-- Nombre 1 -->
- <!-- Nombre 2 -->
- <!-- Nombre 3 -->
- <!-- Nombre 4 -->
