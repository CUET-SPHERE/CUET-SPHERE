package com.cuet.sphere;

import com.cuet.sphere.controller.SemesterController;
import com.cuet.sphere.dto.CurrentSemesterRequest;
import com.cuet.sphere.dto.CurrentSemesterResponse;
import com.cuet.sphere.service.SemesterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

public class SemesterControllerTest {

    @Mock
    private SemesterService semesterService;

    @InjectMocks
    private SemesterController semesterController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testCreateSemester() {
        // Prepare test data
        CurrentSemesterRequest request = new CurrentSemesterRequest();
        request.setSemesterName("Fall 2023");
        request.setDepartment("CSE");
        request.setBatch("22");
        request.setIsActive(true);

        CurrentSemesterResponse expectedResponse = new CurrentSemesterResponse();
        expectedResponse.setId("22");
        expectedResponse.setSemesterName("Fall 2023");
        expectedResponse.setDepartment("CSE");
        expectedResponse.setBatch("22");
        expectedResponse.setIsActive(true);
        expectedResponse.setCourses(new ArrayList<>());

        // Mock the service method
        when(semesterService.createCurrentSemester(request)).thenReturn(expectedResponse);

        // Call controller method
        ResponseEntity<CurrentSemesterResponse> responseEntity = semesterController.createSemester(request);

        // Verify the response
        assertEquals(HttpStatus.CREATED, responseEntity.getStatusCode());
        assertEquals(expectedResponse, responseEntity.getBody());
        verify(semesterService, times(1)).createCurrentSemester(request);
    }

    @Test
    public void testGetActiveSemester() {
        // Prepare test data
        String department = "CSE";
        String batch = "22";
        CurrentSemesterResponse expectedResponse = new CurrentSemesterResponse();
        expectedResponse.setId("22");
        expectedResponse.setSemesterName("Fall 2023");
        expectedResponse.setDepartment(department);
        expectedResponse.setBatch(batch);
        expectedResponse.setIsActive(true);

        // Mock the service method
        when(semesterService.getCurrentActiveSemester(department, batch)).thenReturn(expectedResponse);

        // Call controller method
        ResponseEntity<CurrentSemesterResponse> responseEntity = semesterController.getActiveSemester(department, batch);

        // Verify the response
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedResponse, responseEntity.getBody());
        verify(semesterService, times(1)).getCurrentActiveSemester(department, batch);
    }

    @Test
    public void testGetAllSemesters() {
        // Prepare test data
        String department = "CSE";
        String batch = "22";
        List<CurrentSemesterResponse> expectedResponses = new ArrayList<>();
        CurrentSemesterResponse semester1 = new CurrentSemesterResponse();
        semester1.setId("22");
        semester1.setSemesterName("Fall 2023");
        semester1.setDepartment(department);
        semester1.setBatch(batch);
        semester1.setIsActive(true);
        
        CurrentSemesterResponse semester2 = new CurrentSemesterResponse();
        semester2.setId("22");
        semester2.setSemesterName("Spring 2024");
        semester2.setDepartment(department);
        semester2.setBatch(batch);
        semester2.setIsActive(false);
        
        expectedResponses.add(semester1);
        expectedResponses.add(semester2);

        // Mock the service method
        when(semesterService.getAllSemesters(department, batch)).thenReturn(expectedResponses);

        // Call controller method
        ResponseEntity<List<CurrentSemesterResponse>> responseEntity = semesterController.getAllSemesters(department, batch);

        // Verify the response
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedResponses, responseEntity.getBody());
        verify(semesterService, times(1)).getAllSemesters(department, batch);
    }

    @Test
    public void testUpdateSemester() {
        // Prepare test data
        String batch = "22";
        CurrentSemesterRequest request = new CurrentSemesterRequest();
        request.setSemesterName("Updated Fall 2023");
        request.setDepartment("CSE");
        request.setBatch("22");
        request.setIsActive(true);

        CurrentSemesterResponse expectedResponse = new CurrentSemesterResponse();
        expectedResponse.setId(batch);
        expectedResponse.setSemesterName("Updated Fall 2023");
        expectedResponse.setDepartment("CSE");
        expectedResponse.setBatch("22");
        expectedResponse.setIsActive(true);

        // Mock the service method
        when(semesterService.updateCurrentSemester(batch, request)).thenReturn(expectedResponse);

        // Call controller method
        ResponseEntity<CurrentSemesterResponse> responseEntity = semesterController.updateSemester(batch, request);

        // Verify the response
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedResponse, responseEntity.getBody());
        verify(semesterService, times(1)).updateCurrentSemester(batch, request);
    }

    @Test
    public void testDeleteSemester() {
        // Prepare test data
        String batch = "22";

        // Call controller method
        ResponseEntity<Void> responseEntity = semesterController.deleteSemester(batch);

        // Verify the response
        assertEquals(HttpStatus.NO_CONTENT, responseEntity.getStatusCode());
        verify(semesterService, times(1)).deleteSemester(batch);
    }

    @Test
    public void testSetActiveSemester() {
        // Prepare test data
        String department = "CSE";
        String batch = "22";
        String semesterName = "Fall 2023";
        
        CurrentSemesterResponse expectedResponse = new CurrentSemesterResponse();
        expectedResponse.setId("22");
        expectedResponse.setSemesterName(semesterName);
        expectedResponse.setDepartment(department);
        expectedResponse.setBatch(batch);
        expectedResponse.setIsActive(true);

        // Mock the service method
        when(semesterService.setActiveSemester(department, batch, semesterName)).thenReturn(expectedResponse);

        // Call controller method
        ResponseEntity<CurrentSemesterResponse> responseEntity = 
            semesterController.setActiveSemester(department, batch, semesterName);

        // Verify the response
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertEquals(expectedResponse, responseEntity.getBody());
        verify(semesterService, times(1)).setActiveSemester(department, batch, semesterName);
    }
}