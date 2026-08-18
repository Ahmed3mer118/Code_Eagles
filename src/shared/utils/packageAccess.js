export function packageIncludesLectures(packageType) {
  return packageType === 'lectures_only' || packageType === 'lectures_and_exams';
}

export function packageIncludesExams(packageType) {
  return packageType === 'exams_only' || packageType === 'lectures_and_exams';
}

export function packageIncludesAssignments(packageType) {
  return packageIncludesExams(packageType);
}

export function filterNavByPackage(navItems, packageAccess) {
  if (!packageAccess) return navItems;
  return navItems.filter((item) => {
    if (item.packageAccess === 'lectures') {
      return packageAccess.canLectures !== false || packageAccess.canFreeLectures !== false;
    }
    if (item.packageAccess === 'exams') return packageAccess.canExams !== false;
    if (item.packageAccess === 'assignments') return packageAccess.canAssignments !== false;
    return true;
  });
}
